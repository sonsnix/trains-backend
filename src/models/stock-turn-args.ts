import {  Field, InputType, registerEnumType } from "type-graphql";

@InputType()
export class StockOrder {

  @Field(_type => StockOrderType)
  type: StockOrderType;

  @Field()
  companyId: string;

  // amount only necessary for sell order
  @Field()
  amount?: number;

  // value only necessary for initial bid
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

export enum StockOrderType {
  BUY_INITIAL = "buyInitial",
  BUY_MARKET = "buyMarket",
  SELL = "sell"
}

registerEnumType(StockOrderType, {
  name: "StockOrderType",
});