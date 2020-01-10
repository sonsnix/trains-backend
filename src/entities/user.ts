import { Entity, PrimaryColumn, Column, BaseEntity, ManyToMany, JoinTable } from "typeorm";
import { Game } from "./game";
import { ObjectType, Field } from "type-graphql";

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @Field(_type => String)
    @PrimaryColumn()
    id: string;

    @Field(_type => String)
    @Column()
    name: string;

    @Field(_type => [Game])
    @ManyToMany(
        (_type) => Game,
        (game) => game.players,
        { cascade: true },
    )
    @JoinTable()
    games: Game[];
}
