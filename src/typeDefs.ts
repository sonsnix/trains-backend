import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    getUser(id: String!): User
    getGame(id: String!): Game
    getGames: [Game]
    me: User
    githubLoginUrl: String!
  }
  type Mutation {
    addUser(login: String!): Boolean!
    authorizeWithGithub(code: String!): String
  }
  type User {
    id: String!
    name: String!
    games: [Game]
  }

  type Game {
    id: String!
    name: String!
    state: String!
    players: [User]
  }
`;