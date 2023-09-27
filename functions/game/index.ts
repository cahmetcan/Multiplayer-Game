import { IUser } from "../user/types";
import { IPlayer } from "./type";

export enum Directions {
  up = "w",
  down = "a",
  left = "s",
  right = "d",
}
export class Game {
  users: Map<string, IPlayer> = new Map();
  status: "playing" | "ended" = "playing";

  constructor(minutes: number) {
    this.users = new Map();
  }

  getUser(name: string) {
    return this.users.get(name);
  }

  addUser(user: IUser, ws: WebSocket) {
    const player = {
      data: user,
      ws: ws,
      score: 0,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    };

    console.log("new user adding");
    console.log(player);
    this.users.set(user.name, player);
    ws.send(
      "You added to game room. You can start playing. You can use arrow keys to move."
    );
    console.log("user count is now -> " + this.users.size);
    this.broadcast("New user added to game room." + user.name);

    ws.send(this.userCoordinates());
  }

  userCoordinates() {
    const players = Array.from(this.users.values());
    return JSON.stringify({
      type: "allCoordinates",
      data: players.map((player) => ({
        user: player.data.name,
        x: player.x,
        y: player.y,
      })),
    });
  }
  move(user: IUser, direction: Directions) {
    const player = this.users.get(user.name);
    if (!player) return;

    if (direction === Directions.up) {
      player.y += 1;
    }
    if (direction === Directions.down) {
      player.y -= 1;
    }
    if (direction === Directions.left) {
      player.x -= 1;
    }
    if (direction === Directions.right) {
      player.x += 1;
    }

    this.broadcast(
      JSON.stringify({
        type: "coordinates",
        data: {
          user: user.name,
          x: player.x,
          y: player.y,
        },
      })
    );
  }
  removeUser(user: IUser) {
    this.users.delete(user.name);
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

  broadcast(message: string) {
    this.users.forEach((player) => {
      player.ws.send(message);
    });
  }
}
