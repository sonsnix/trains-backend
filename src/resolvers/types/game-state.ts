import { ObjectType, Field } from "type-graphql";
import { GraphQLJSONObject } from "graphql-type-json";

@ObjectType()
export class GameStateMisc {
  @Field()
  curCompany: string;

  @Field()
  curPhase: string;

  @Field()
  curPlayer: string;

  @Field()
  curTrainPhase: number;
}

@ObjectType()
export class Player {
  @Field()
  id: string;

  @Field()
  cash: number;

  @Field((_type) => GraphQLJSONObject)
  shares: { [key: string]: number };
}

@ObjectType()
export class Company {
  @Field()
  cash: number;

  @Field()
  name: string;

  @Field()
  fullName: string;

  @Field((_type) => [String])
  trains: string[];

  @Field()
  floated: false;

  @Field()
  parValue: number;

  @Field()
  stockLeft: number;
}

@ObjectType()
export class GameState {
  @Field()
  misc: GameStateMisc;

  @Field((_type) => [Company])
  companies: Company[];

  @Field((_type) => [Player])
  players: Player[];
}

export const initialState = (): GameState => {
  const players: Player[] = [
    {
      id: "github/Hans",
      cash: 1000,
      shares: {
        sanuki: 5,
      },
    },
  ];

  const game = {
    curCompany: "sanuki",
    curPhase: "track",
    curPlayer: "github/Hans",
    curTrainPhase: 4,
  };

  const companies: Company[] = [];

  for (const company of [
    ["sanuki", "Sanuki"],
    ["firma2", "ordentlicher Name"],
  ]) {
    companies.push({
      name: company[0],
      fullName: company[1],
      cash: 500,
      floated: false,
      parValue: 0,
      stockLeft: 10,
      trains: [],
    });
  }

  // const tiles = tilesInitialState;

  const state: GameState = {
    // map: { tiles: tilesInitialState },
    players: players,
    companies: companies,
    misc: game,
  };

  console.log(state);

  return state;
};
