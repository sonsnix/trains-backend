import { Entity, PrimaryColumn, Column, BaseEntity, ManyToMany, JoinTable } from "typeorm";
import { Game } from "./Game";

@Entity()
export class User extends BaseEntity {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @ManyToMany(_type => Game, game => game.players, {cascade: true})
    @JoinTable()
    games: Game[];

}
