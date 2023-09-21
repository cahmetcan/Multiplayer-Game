import { IUser } from "../user/types";
import { IPlayer } from "./type";

export class Game {
  users: Map<string, IPlayer> = new Map();
  status: "playing" | "ended" = "playing";

  constructor(minutes: number) {
    this.users = new Map();

    setTimeout(() => {
      this.end();
    }, minutes * 60 * 1000);
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

  moveUser(user: IUser, x: number, y: number) {
    const player = this.users.get(user.id);
    if (!player) return;

    player.x = x;
    player.y = y;
  }

  end() {
    console.log("Game is over!");
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
