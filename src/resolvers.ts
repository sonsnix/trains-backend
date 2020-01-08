import { IResolvers } from "apollo-server-express";
import authorizeWithGithub from "./models/githubAuth";

export const resolvers: IResolvers = {
    Query: {
        getUser: async (_parent, args, context) => {
            const { id } = args;

            return await context.models.User.findOne({ where: { id: id }, relations: ["games"] });
        },
        getGame: async (_parent, args, context) => {
            const { id } = args;

            return await context.models.Game.findOne({ where: { id: id }, relations: ["players"] });
        },
        getGames: async (_parent, _args, context) => {
            return await context.models.Game.find({ relations: ["players"] });
        },
        githubLoginUrl: () =>
            `https://github.com/login/oauth/authorize?client_id=${
            process.env.GITHUB_CLIENT_ID
            }&scope=user`,

        me: (_parent, _args, context) => {
            return context.models.User.findOne({ where: { id: context.user.id } })
        }
    },
    Mutation: {
        addUser: async (_parent: any, args: any, context) => {
            const { name } = args;
            try {
                const user = context.models.User.create({
                    name
                });

                await user.save();

                return true;
            } catch (error) {
                return false;
            }
        },
        authorizeWithGithub: (_parent, args, context) => { return authorizeWithGithub(args, context); },
    },
};