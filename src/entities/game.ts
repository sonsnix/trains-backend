import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { ObjectType, Field } from "type-graphql";

import { User } from "./user";
import { GameState } from "../resolvers/types/game-state";

@Entity()
@ObjectType()
export class Game extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field((_type) => String)
  @Column()
  name: string;

  @Field(_type => [GameState])
  @Column({type: "json"})
  states: GameState[];

  @Field((_type) => [User], { nullable: true })
  @ManyToMany(
    (_type) => User,
    (user) => user.games,
  )
  players: User[];
}
