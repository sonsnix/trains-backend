import {  Field, InputType } from "type-graphql";

@InputType()
export class StockOrder {
  @Field()
  type: string;

  @Field()
  share: string;

  @Field()
  amount: number;

  @Field({ nullable: true })
  value?: number;
}

@InputType()
export class StockTurnArgs {
  @Field((_type) => [StockOrder], {nullable: true})
  orders: StockOrder[];

  @Field()
  gameId: string;
}
