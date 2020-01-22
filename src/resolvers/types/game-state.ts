import { ObjectType, Field, Int } from "type-graphql";
import { adjustStock, AdjustStockAction, getStockValue } from "../models/stockMarket";
import { StockTurnArgs, StockOrderType, StockOrder } from "./stock-turn-args";
import { Context } from "../../types";

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
export class StockPosition {
  @Field((_type) => Int)
  row: number;

  @Field((_type) => Int)
  col: number;

  @Field((_type) => Int)
  z: number;
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
  id: string;

  @Field()
  fullName: string;

  @Field((_type) => [String])
  trains: string[];

  @Field()
  floated: false;

  @Field({ nullable: true })
  parValue?: number;

  @Field({ nullable: true })
  stockPosition?: StockPosition;

  @Field()
  initialOffer: number;

  @Field()
  market: number;
}

export const initialState = (): GameState => {
  const players: Player[] = [
    {
      id: "github/sonsnix",
      cash: 1000,
      shares: [],
      passed: false,
    },
    {
      id: "github/Hans",
      cash: 1000,
      shares: [],
      passed: false,
    },
  ];

  const status = {
    curCompany: "sanuki",
    curPhase: "stock",
    curPriority: 0,
    curTrainPhase: 4,
    playerOrder: [0, 1],
  };

  const companies: Company[] = [];

  for (const company of [
    ["sanuki", "Sanuki Railways"],
    ["iyo", "Iyo Railroad"],
    ["awa", "Awa Railways"],
    ["takamatsu", "Takamatsu - Kotohira Electric Rail"],
    ["tosa_electric", "Tosa Electric Rail"],
    ["tosa", "Tosa Kuroshio Railroad"],
    ["uwajima", "Uwajima Railroad"],

  ]) {
    companies.push({
      id: company[0],
      fullName: company[1],
      cash: 500,
      floated: false,
      parValue: undefined,
      initialOffer: 10,
      market: 0,
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

export async function submitStockTurnHelper(
  args: StockTurnArgs,
  { user }: Context,
  state: GameState,
): Promise<GameState> {
  if (state.status.curPhase != "stock") throw new Error("Game is not in the stock phase");

  const player = state.players.find((player) => player.id == user);

  if (!player) throw new Error(`Player ${user} couldn't be found in game.`);
  if (state.status.playerOrder[0] != state.players.indexOf(player)) throw new Error("It's not the player's turn");

  player.passed = !args.orders;

  for (const order of args.orders) {
    await processOrder(state, order, player);
  }

  // check if all players have passed; if yes, initialize new round
  if (state.players.every((player) => player.passed)) {
    intializeTrackRound(state);
  } else {
    if (!state.players.length) {
      const playerNumbers = [...state.players.keys()];
      state.status.playerOrder = playerNumbers
        .slice(state.status.curPriority, state.players.length)
        .concat(playerNumbers.slice(0, state.status.curPriority));
    }
  }

  return state;
}

async function processOrder(state: GameState, order: StockOrder, player: Player) {
  const company = state.companies.find((company) => company.id == order.companyId);
  if (!company) throw new Error("Company does not exist.");

  if (order.amount && order.amount < 1) throw new Error("Order amount must be at least 1");

  if (order.type == StockOrderType.BUY_INITIAL || order.type == StockOrderType.BUY_MARKET) {
    let orderAmount = 1;
    let orderValue: number | null;

    // check if we are starting a new company;
    // if yes, set par value and set order amount to 2 (presidential certificiate)
    if (!company.parValue) {
      if (!order.value) throw new Error("Par value needed for starting a company.");

      const parValueIndex = [65, 70, 75, 80, 90, 100].indexOf(order.value);

      if (parValueIndex == -1) throw new Error("Invalid par value");

      company.parValue = order.value;
      company.stockPosition = { row: 5 + parValueIndex, col: 3, z: 0 };
      adjustStock(state.companies, company, AdjustStockAction.START_COMPANY);

      orderAmount = 2;
    }

    if (order.type == StockOrderType.BUY_INITIAL) {
      orderValue = company.parValue;

      if (company.initialOffer < orderAmount) throw new Error("Not enough shares left");
      company.initialOffer -= orderAmount;
    } else {
      orderValue = getStockValue(company);

      if (!orderValue) throw new Error("PANIC: Couldn't retrieve stock value");

      if (company.market < 1) throw new Error("Not enough shares left");
      company.market -= 1;
    }

    if (player.cash < company.parValue * orderAmount) throw new Error("Player doesn't have enough cash.");
    player.cash -= orderAmount * orderValue;

    // check if player already has shares from this company; otherwise create new entry
    const share = player.shares.find((share) => share.id == company.id);
    if (share) share.amount += orderAmount;
    else player.shares.push({ id: order.companyId, amount: orderAmount });
  } else if (order.type == StockOrderType.SELL) {
    if (!order.amount) throw new Error("Amount of shares to be sold has to be specified");

    const share = player.shares.find((share) => share.id == company.id);
    
    if (!share || share.amount < order.amount) throw new Error("Player doesn't have enough shares to sell");

    if (company.initialOffer + company.market + order.amount > 8)
      throw new Error("Player can't sell presidential share");

    const value = getStockValue(company);

    if (!value) throw new Error("PANIC: Couldn't retrieve stock value");

    company.market += order.amount;
    share.amount -= order.amount;
    player.cash += order.amount * value!;

    adjustStock(state.companies, company, AdjustStockAction.SHARES_SOLD);
  } else throw new Error("Unknown order type");
}

export const intializeTrackRound = (state: GameState) => {
  state.status.curPriority =
    state.status.playerOrder[0] - 1 < 0 ? state.players.length - 1 : state.status.playerOrder[0] - 1;
  state.status.curPhase = "track";

  // increase share value if all shares are sold to players
  for (const company of state.companies) {
    if (!company.market && !company.initialOffer)
      adjustStock(state.companies, company, AdjustStockAction.ALL_SHARES_HELD);
  }
};
