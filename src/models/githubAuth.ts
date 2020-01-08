import fetch from 'node-fetch';
import { AuthenticationError } from 'apollo-server-express';
import * as jwt from "jsonwebtoken";

type Credentials = {
    client_id: string,
    client_secret: string,
    code: string
}

type GithubResponse = {
    name: string,
    login: string,
    access_token?: string
}

const requestGithubToken = (credentials: Credentials) =>
    fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(credentials)
    })
        .then(res => res.json())
        .catch(error => {
            throw new Error(JSON.stringify(error));
        });

const requestGithubUserAccount = (token: string) =>
    fetch(`https://api.github.com/user?access_token=${token}`).then(
        res => res.json() as Promise<GithubResponse>
    );

const requestGithubUser = async (credentials: Credentials): Promise<GithubResponse> => {
    const { access_token } = await requestGithubToken(credentials);
    const githubUser = await requestGithubUserAccount(access_token);

    return { ...githubUser, access_token: access_token };
};

const authorizeWithGithub = async (args: { code: string }, context: any): Promise<String> => {
    const githubUser = await requestGithubUser({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code: args.code
    });

    if (!githubUser.login) {
        throw new AuthenticationError("Authentication failed.");
    }

    let user = new context.models.User();
    user.id = "github/" + githubUser.login;
    user.name = githubUser.login;
    await user.save();

    return jwt.sign({id: user.id, name: user.name}, process.env.JWT_SECRET as string);
}

export default authorizeWithGithub;