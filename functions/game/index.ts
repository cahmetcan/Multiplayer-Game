import { IUser } from "../user/types";
import { IPlayer } from "./type";

type Env = {
  ROOMS: KVNamespace;
};
export class Game {
  users: Map<string, IPlayer> = new Map();
  status: "playing" | "ended" = "playing";

  constructor(minutes: number, env: Env) {
    this.users = new Map();

    setTimeout(() => {
      this.end(env, roomId);
    }, 1 * 60 * 1000);
  }

  addUser(user: IUser) {
    const player = {
      data: user,
      score: 0,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    };

    this.users.set(user.id, player);
  }

  removeUser(user: IUser) {
    this.users.delete(user.id);
  }

  /*   moveUser(user: IUser, x: number, y: number) { // security issue here - user can send any x and y
    const player = this.users.get(user.id);
    if (!player) return;

    player.x = x;
    player.y = y;
  } */

  moveUp(user: IUser) {
    const player = this.users.get(user.id);
    if (!player) return;

    player.y -= 1;
  }

  moveDown(user: IUser) {
    const player = this.users.get(user.id);
    if (!player) return;

    player.y += 1;
  }

  moveLeft(user: IUser) {
    const player = this.users.get(user.id);
    if (!player) return;

    player.x -= 1;
  }

  moveRight(user: IUser) {
    const player = this.users.get(user.id);
    if (!player) return;

    player.x += 1;
  }

  end(env: Env, roomId: string) {
    console.log("Game is over!");

    env.ROOMS.delete(roomId);

    this.status = "ended";
    return {
      winner: this.getScores()[0],
      users: this.getScores(),
    };
  }

  getScores() {
    const players = Array.from(this.users.values());
    players.sort((a, b) => b.score - a.score);

    return players;
  }
}
