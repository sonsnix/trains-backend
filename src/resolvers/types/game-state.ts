import { ObjectType, Field } from "type-graphql";

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
export class GameState {
  @Field()
  misc: GameStateMisc;
}