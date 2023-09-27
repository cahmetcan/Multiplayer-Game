import { IUser } from "../user/types";
import { IPlayer } from "./type";

export class Game {
  users: Map<string, IPlayer> = new Map();
  status: "playing" | "ended" = "playing";

  constructor(minutes: number) {
    this.users = new Map();
  }

  addUser(user: IUser, ws: WebSocket) {
    const player = {
      data: user,
      ws: ws,
      score: 0,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    };

    this.users.set(user.name, player);
  }

  userCoordinates() {
    this.users.forEach((player) => {
      player.ws.send(
        JSON.stringify({
          type: "coordinates",
          data: {
            x: player.x,
            y: player.y,
          },
        })
      );
    });
  }

  removeUser(user: IUser) {
    this.users.delete(user.name);
  }

  moveUp(user: IUser) {
    const player = this.users.get(user.name);
    if (!player) return;

    player.y += 1;
  }

  moveDown(user: IUser) {
    const player = this.users.get(user.name);
    if (!player) return;

    player.y -= 1;
  }

  moveLeft(user: IUser) {
    const player = this.users.get(user.name);
    if (!player) return;

    player.x -= 1;
  }

  moveRight(user: IUser) {
    const player = this.users.get(user.name);
    if (!player) return;

    player.x += 1;
  }

  /*   end(roomId: string) {
    console.log("Game is over!");

    // kill everything in this object
    this.users.clear();

    this.status = "ended";
    return {
      winner: this.getScores()[0],
      users: this.getScores(),
    };
  } */

  getScores() {
    const players = Array.from(this.users.values());
    players.sort((a, b) => b.score - a.score);

    return players;
  }
}
