import "reflect-metadata";
import * as TypeORM from "typeorm";
import { Container } from "typedi";
import * as TypeGraphQL from "type-graphql";

import * as express from "express";
import { ApolloServer } from "apollo-server-express";

import * as jwt from "jsonwebtoken";

const dotenv = require("dotenv");

import { UserResolver } from "./resolvers/user-resolver";
import { GameResolver } from "./resolvers/game-resolver";

import { initialState } from "./models/state";
import { User } from "./entities/user";
import { Game } from "./entities/game";

dotenv.config();
TypeORM.useContainer(Container);

const getUser = (token: string) => {
  try {
    if (token) {
      return jwt.verify(token.split(" ")[1], process.env.JWT_SECRET as string);
    }
    return null;
  } catch (err) {
    return null;
  }
};

async function seedDatabase() {
  const game = new Game();
  game.name = "First game!";
  game.state = initialState();
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
    resolvers: [UserResolver, GameResolver],
    container: Container,
  });

  console.log(schema);

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      const user = getUser(token);

      return { user };
    },
    introspection: true,
    playground: true,
  });

  await seedDatabase();

  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: process.env.PORT || 4000 }, () => console.log(`Server ready`));
};

startServer();
