import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";

import * as jwt from "jsonwebtoken";

const dotenv = require("dotenv");

import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

import { User } from "./entity/User";
import { Game } from "./entity/Game";

dotenv.config();

const getUser = (token: string) => {
    try {
        if (token) {
            return jwt.verify(token.split(' ')[1], process.env.JWT_SECRET as string)
        }
        return null
    } catch (err) {
        return null
    }
}

const startServer = async () => {
    const server = new ApolloServer({
        typeDefs, resolvers, context: ({ req }) => {
            const token = req.headers.authorization || ''
            const user = getUser(token);

            return { models: { User, Game }, user };
        }
    });

    await createConnection();

    const game = new Game();
    game.name = "Mein erstes Spiel";
    game.state = "{}";
    await game.save();

    console.log(game);

    let user = new User();
    user.id = "github/Hans";
    user.name = "Hans";
    user.games = [game];
    await user.save();

    user = new User();
    user.id = "github/Horst";
    user.name = "Horst";
    user.games = [game];
    await user.save();

    console.log(game);

    const app = express();

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
};

startServer();