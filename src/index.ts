import "reflect-metadata";
import * as TypeORM from "typeorm";
import { Container } from "typedi";
import * as TypeGraphQL from "type-graphql";

import * as express from "express";
import * as cookieParser from "cookie-parser";

import * as jwt from "jsonwebtoken";

import { ApolloServer } from "apollo-server-express";

const dotenv = require("dotenv");

import { UserResolver } from "./resolvers/user-resolver";
import { GameResolver } from "./resolvers/game-resolver";

import { initialState } from "./resolvers/types/game-state";
import { User } from "./entities/user";
import { Game } from "./entities/game";

import { CompanyResolver } from "./resolvers/company-resolver";
import { Context } from "./types";

dotenv.config();
TypeORM.useContainer(Container);

async function seedDatabase() {
  const game = new Game();
  game.name = "First game!";
  game.states = [initialState()];
  await game.save();

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
}

const startServer = async () => {
  await TypeORM.createConnection();

  const schema = await TypeGraphQL.buildSchema({
    resolvers: [UserResolver, GameResolver, CompanyResolver],
    container: Container,
  });

  const server = new ApolloServer({
    schema,
    context: ({ req, res }: Context): Context => {
      let user: string;

      try {
        const token = (req as any).cookies["access_token"];
        user = jwt.verify(token, process.env.JWT_SECRET as string) as string;
      } catch (e) {
        user = "github/Hans";
      }

      console.log(user);

      return { user, req, res };
    },
    introspection: true,
    playground: true,
  });

  await seedDatabase();

  const app = express();

  app.use(cookieParser());

  server.applyMiddleware({
    app,
    path: process.env.GRAPHQL_PATH,
    cors: {
      credentials: true,
      origin: "http://localhost:3000",
    },
  });

  app.listen({ port: process.env.PORT || 4000 }, () => console.log(`Server ready`));
};

startServer();
