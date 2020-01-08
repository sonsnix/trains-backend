import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { User } from "./User";

@Entity()
export class Game extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ type: "json" })
    state: string;

    @ManyToMany(_type => User, user => user.games)
    players: User[];

}
