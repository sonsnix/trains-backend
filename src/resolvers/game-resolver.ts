import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

// import { User } from "../entities/user";
import { Game } from "../entities/game";
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

  @Mutation((_returns) => String)
  async submitStockTurn() {
    const game = await this.gameRepository.findOne();

    if(!game) return "";

    game.state.misc.curPlayer = "Freddy";
    this.gameRepository.save(game);
    return "";
  }

  @Mutation((_returns) => String)
  submitCompanyTurn() {
    return "";
  }
}
