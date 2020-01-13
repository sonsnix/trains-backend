import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class Status {
  @Field()
  curCompany: string;

  @Field()
  curPhase: string;

  @Field()
  curPriority: number;

  @Field((_type) => [Number])
  playerOrder: number[];

  @Field()
  curTrainPhase: number;
}

@ObjectType()
export class GameState {
  @Field()
  status: Status;

  @Field((_type) => [Company])
  companies: Company[];

  @Field((_type) => [Player])
  players: Player[];
}

@ObjectType()
export class Player {
  @Field()
  id: string;

  @Field()
  cash: number;

  @Field((_type) => [Share])
  shares: Share[];

  @Field()
  passed: boolean;
}

@ObjectType()
export class Share {
  @Field()
  id: string;

  @Field()
  amount: number;
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
  parValue?: number;

  @Field()
  stockLeft: number;
}

export const initialState = (): GameState => {
  const players: Player[] = [
    {
      id: "github/sonsnix",
      cash: 1000,
      shares: [
        {
          id: "sanuki",
          amount: 5,
        },
      ],
      passed: false,
    },
    {
      id: "github/Hans",
      cash: 1000,
      shares: [
        {
          id: "sanuki",
          amount: 5,
        },
      ],
      passed: false,
    },
  ];

  const status = {
    curCompany: "sanuki",
    curPhase: "stock",
    curPriority: 0,
    curTrainPhase: 4,
    playerOrder: [0, 1]
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
    players,
    companies,
    status,
  };

  console.log(state);

  return state;
};
