import { gql } from "apollo-server-express";

export const typeDefs = gql`
    type Query {
      getUser(id: String!): User
      getUsers: [User]
      getGame(id: String!): Game
      getGames: [Game]
      me: User
      githubLoginUrl: String!
    }

    type Mutation {
      authorizeWithGithub(code: String!): String
      submitCompanyTurn(action: CompanyTurnAction!): String
      submitStockTurn(actions: StockTurnAction!): String
    }

    input CompanyTurnAction {
      track: Track!
      station: String!
      operations: [Operation]!
      payDividend: Boolean!
    }

    input StockTurnAction {
      buy: 
    }

    type Operation {
      train: String!
      path: [String!]!
    }

    type Track {
      type: String!
      loc: String!
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
