import "reflect-metadata";
import * as TypeORM from "typeorm";
import { Container } from "typedi";
import * as TypeGraphQL from "type-graphql";

import * as express from "express";
import * as expressJwt from "express-jwt";

// import * as jwt from "jsonwebtoken";

import { ApolloServer } from "apollo-server-express";

const dotenv = require("dotenv");

import { UserResolver } from "./resolvers/user-resolver";
import { GameResolver } from "./resolvers/game-resolver";

import { initialState } from "./resolvers/types/game-state";
import { User } from "./entities/user";
import { Game } from "./entities/game";

import {AuthInfoRequest} from "./types";
import { CompanyResolver } from "./resolvers/company-resolver";

dotenv.config();
TypeORM.useContainer(Container);

// const getUser = (token: string) => {
//   try {
//     if (token) {
//       return jwt.verify(token.split(" ")[1], process.env.JWT_SECRET as string);
//     }
//     return null;
//   } catch (err) {
//     return null;
//   }
// };

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

  console.log(schema);

  const server = new ApolloServer({
    schema,
    context: ({ req }: {req: AuthInfoRequest}) => {
      const user = "github/sonsnix" || req.user;
      console.log(user);

      return { user };
    },
    introspection: true,
    playground: true,
  });

  await seedDatabase();

  const app = express();

  app.use(
    process.env.GRAPHQL_PATH!,
    expressJwt({
      secret: process.env.JWT_SECRET!,
      credentialsRequired: false,
    }),
  );
  

  server.applyMiddleware({ app, path: process.env.GRAPHQL_PATH });

  app.listen({ port: process.env.PORT || 4000 }, () => console.log(`Server ready`));
};

startServer();
