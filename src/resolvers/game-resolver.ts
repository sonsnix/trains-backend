import { Resolver, Query, Arg, Mutation, FieldResolver, Root, Ctx } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import produce from "immer";

// import { User } from "../entities/user";
import { Game } from "../entities/game";
import { GameState } from "./types/game-state";
import { StockTurnArgs } from "./types/stock-turn-args";
import { Context } from "../types";
// import { Context } from "../types";

// import { submitCompanyTurn, submitStockTurn } from "./models/state";

@Resolver(Game)
export class GameResolver {
  constructor(
    //@InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  @Query((_returns) => Game, { nullable: true })
  getGame(@Arg("gameId", (_type) => String) gameId: String) {
    return this.gameRepository.findOne({
      where: { id: gameId },
      relations: ["players"],
    });
  }

  @Query((_returns) => [Game], { nullable: true })
  getGames() {
    return this.gameRepository.find({ relations: ["players"] });
  }

  @Mutation((_returns) => GameState, { nullable: true })
  async submitStockTurn(
    @Arg("args", (_type) => StockTurnArgs) args: StockTurnArgs,
    @Ctx() { user }: Context,
  ): Promise<GameState> {
    if (!user) throw new Error("Not logged in.");

    const game = await this.gameRepository.findOne({ where: { id: args.gameId, relations: ["players"] } });

    if (!game) throw new Error(`Game ${args.gameId} couldn't be found.`);

    const newState = produce(game.states[game.states.length - 1], (state) => {
      if (state.status.curPhase != "stock") throw new Error("Game is not in the stock phase");

      const player = state.players.find((player) => player.id == user);

      if (!player) throw new Error(`Player ${user} couldn't be found in game.`);

      if (state.status.playerOrder[0] != state.players.indexOf(player))
        throw new Error("It's not the player's turn");

      player.passed = !args.orders;

      for (const order of args.orders) {
        const company = state.companies.find((company) => company.name == order.share);

        if (!company) throw new Error("Company does not exist.");

        if (order.type == "buy") {
          if (company.stockLeft <= order.amount) {
            throw new Error("Not enough shares left");
          }

          let value = 0;

          // check if we need to buy presdiential certificate first
          if (!company.parValue) {
            if (!order.value) throw new Error("No initial offer yet, par value needed.");
            if (order.amount < 2) throw new Error("Presidential Certificate must be bought first.");
            if (player.cash < order.value * order.amount) throw new Error("Player doesn't have enough money.");

            company.parValue = order.value;
            value = company.parValue;
          } else {
            value = 65;
          }

          const share = player.shares.find((share) => share.id == company.name);

          if (share) share.amount += order.amount;
          else player.shares.push({ id: order.share, amount: order.amount });

          company.stockLeft -= order.amount;
          player.cash -= order.amount * value;
        } else if (order.type == "sell") {
          const share = player.shares.find((share) => share.id == company.name);

          if (!share || share.amount < order.amount) throw new Error("Player doesn't have enough shares to sell");
          if (company.stockLeft + order.amount > 8) throw new Error("Player can't sell presidential share");

          const value = 65;

          company.stockLeft += order.amount;
          share.amount -= order.amount;
          player.cash += order.amount * value;
        } else throw new Error("Unknown order type");
      }

      state.players.shift();

      if(state.players.every(player => player.passed)) {
          state.status.curPriority = state.players.indexOf(player) - 1 < 0 ? state.players.length - 1: state.players.indexOf(player) - 1;
          state.status.curPhase = "track";
        //   prepare new player / company order
      }

      if(!state.players.length) {
        const playerNumbers = [...state.players.keys()];
        state.status.playerOrder = playerNumbers.slice(state.status.curPriority, state.players.length).concat(playerNumbers.slice(0, state.status.curPriority));
      }
    });

    game.states.push(newState);
    await this.gameRepository.save(game);

    return newState;
  }

  @Mutation((_returns) => String)
  submitCompanyTurn() {
    return "";
  }

  @FieldResolver((_type) => GameState)
  state(@Root() game: Game) {
    return game.states[game.states.length - 1];
  }
}
