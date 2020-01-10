import { Resolver, Query, Arg, Ctx, Mutation } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { User } from "../entities/user";
// import { Game } from "../entities/game";
import { Context } from "../types";

import authorizeWithGithub from "../models/githubAuth";

// import { submitCompanyTurn, submitStockTurn } from "./models/state";

@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) // @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  {}

  @Query((_returns) => User, { nullable: true })
  getUser(@Arg("userId", (_type) => String) userId: String) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ["games"],
    });
  }

  @Query((_returns) => [User], { nullable: true })
  getUsers() {
    return this.userRepository.find({ relations: ["games"] });
  }

  @Query((_returns) => String)
  githubLoginUrl() {
    return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`;
  }

  @Query((_returns) => User, { nullable: true })
  me(@Ctx() { user }: Context) {
    return this.userRepository.findOne({ where: { id: user! } });
  }

  @Mutation(_returns => String)
  authorizeWithGithub(@Arg("code", (_type) => String) code: string) {
    return authorizeWithGithub(code, this.userRepository);
  }
}
