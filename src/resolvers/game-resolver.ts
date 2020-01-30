import { Resolver, Query, Arg, Mutation, FieldResolver, Root, Ctx } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

// import { User } from "../entities/user";
import { Game } from "../entities/game";
import { GameState, submitStockTurnHelper } from "../models/game-state";
import { StockTurnArgs } from "../models/stock-turn-args";
import { Context } from "../types";
import produce from "immer";

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
    @Ctx() { user, req, res }: Context,
  ): Promise<GameState> {
    if (!user) throw new Error("Not logged in.");

    //const game = await this.gameRepository.findOne({ where: { id: args.gameId}, relations: ["players"] } );
    const game = await this.gameRepository.findOne({ relations: ["players"] });

    if (!game) throw new Error(`Game ${args.gameId} couldn't be found.`);

    const newState: GameState = await produce(game.states[game.states.length - 1], async (draftState: GameState) => {
      await submitStockTurnHelper(args, { user, req, res }, draftState);
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
  state(@Root() game: Game): GameState {
    return game.states[game.states.length - 1];
  }
}
