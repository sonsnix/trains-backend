import { Company } from "../models/game-state";
import { Resolver, FieldResolver, Int, Root } from "type-graphql";
import { getStockValue } from "../models/stock-market";

@Resolver(Company)
export class CompanyResolver {
  @FieldResolver((_type) => Int, {nullable: true})
  stockValue(@Root() company: Company) {
    return getStockValue(company);
  }
}
