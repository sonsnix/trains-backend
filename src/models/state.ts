import produce from "immer";
import { tilesInitialState } from "./data";
import {Game} from "../entities/game";

enum GamePhase {
  STOCK = "stock",
  TRACK = "track",
}

export type GameState = {
  [key: string]: any;
  map: { tiles: { [key: string]: TileType } };
  companies: { [key: string]: Company };
  players: { [key: string]: Player };
  game: {
    curCompany: string;
    curPhase: GamePhase;
    curPlayer: string;
    curTrainPhase: number;
  };
  ui?: { selectedLoc?: string };
};

type Company = {
  name: string;
  cash: number;
  trains: { [key: string]: number };
  floated: boolean;
  stockLeft: number;
  stockValue: number;
  parValue: number;
  curCEO?: string;
};

type Companies = {
  [key: string]: Company;
};

type Player = {
  name: string;
  cash: number;
  shares: { [key: string]: number };
};

type Players = {
  [key: string]: Player;
};

type TileType = {
  type: string;
  rotation: number;
};

type Action = {
  type: string;
  payload: any;
};

export const submitCompanyTurn = async (_args: { actions: Action[] }, context: any): Promise<GameState> => {
  const game = await context.models.Game.findOne() as Game;

  return produce(game.state, (newState: GameState) => {
    return newState;
  });
};

export const submitStockTurn = async (_args: { actions: Action[] }, context: any): Promise<GameState> => {
  const game = await context.models.Game.findOne() as Game;
  
  return produce(game.state as GameState, (newState: GameState) => {
    return newState;
  });
};

export const initialState = (): GameState => {
  const players: Players = {
    "github/Hans": {
      name: "Hans",
      cash: 1000,
      shares: {
        sanuki: 5,
      },
    },
  };

  const game = {
    curCompany: "sanuki",
    curPhase: GamePhase.TRACK,
    curPlayer: "github/Hans",
    curTrainPhase: 4,
  };

  const companies: Companies = {};

  for (const company in [
    ["sanuki", "Sanuki"],
    ["firma2", "ordentlicher Name"],
  ]) {
    companies[company[0]] = {
      name: company[1],
      cash: 500,
      floated: false,
      parValue: 0,
      stockLeft: 10,
      stockValue: 0,
      trains: {},
      curCEO: "",
    };
  }

  const state: GameState = {
    map: { tiles: tilesInitialState },
    players: players,
    companies: companies,
    game: game,
  };

  return state;
};
