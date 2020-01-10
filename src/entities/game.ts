import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { ObjectType, Field } from "type-graphql";

import { User } from "./user";
import {GameState} from "../models/state";

@Entity()
@ObjectType()
export class Game extends BaseEntity {
    @Field(_type => String)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Field(_type => String)
    @Column()
    name: string;

    @Field(_type => String)
    @Column({ type: "json" })
    state: GameState;

    @Field(_type => [User])
    @ManyToMany(
        (_type) => User,
        (user) => user.games,
    )
    players: User[];
}
