import fetch from "node-fetch";
import { AuthenticationError } from "apollo-server-express";
import * as jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { User } from "../entities/user";

type Credentials = {
    client_id: string;
    client_secret: string;
    code: string;
};

type GithubResponse = {
    name: string;
    login: string;
    access_token?: string;
};

const requestGithubToken = async (credentials: Credentials): Promise<{access_token: string}> => {
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    return res.json();
};

const requestGithubUserAccount = (token: string) =>
    fetch(`https://api.github.com/user?access_token=${token}`).then((res) => res.json() as Promise<GithubResponse>);

const requestGithubUser = async (credentials: Credentials): Promise<GithubResponse> => {
    const { access_token } = await requestGithubToken(credentials);
    const githubUser = await requestGithubUserAccount(access_token);

    return { ...githubUser, access_token: access_token };
};

const authorizeWithGithub = async (code: string, userRepository: Repository<User>): Promise<String> => {
    const githubUser = await requestGithubUser({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
    });

    if (!githubUser.login) {
        throw new AuthenticationError("Authentication failed.");
    }

    let user = new User();
    user.id = "github/" + githubUser.login;
    user.name = githubUser.login;
    await userRepository.save(user);

    return jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET as string);
};

export default authorizeWithGithub;
