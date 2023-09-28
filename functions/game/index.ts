import {
  IUser,
  ResponseAllCoordinates,
  ResponseNewUser,
  ResponseRemoveUser,
  ResponseMove,
} from "../user/types";
import { IPlayer } from "./type";

export enum Directions {
  up = "w",
  down = "s",
  left = "a",
  right = "d",
}
export class Game {
  users: Map<string, IPlayer> = new Map();
  status: "playing" | "ended" = "playing";

  constructor(minutes: number) {
    this.status = "playing";
    this.users = new Map();
  }

  getUser(name: string) {
    return this.users.get(name);
  }

  addUser(user: IUser, ws: WebSocket): ResponseNewUser {
    const player: IPlayer = {
      name: user.name,
      color: user.color,
      ws: ws,
      score: 0,
      x: Math.floor(Math.random() * 500),
      y: Math.floor(Math.random() * 500),
    };

    this.users.set(user.name, player);

    return {
      type: "newUser",
      data: {
        name: user.name,
        color: user.color,
        x: player.x,
        y: player.y,
      },
    };
  }

  userCoordinates(): ResponseAllCoordinates {
    const players = Array.from(this.users.values());

    return {
      type: "allCoordinates",
      data: players.map((player) => ({
        name: player.name,
        color: player.color,
        x: player.x,
        y: player.y,
      })),
    };
  }

  move(user: IUser, direction: Directions): ResponseMove {
    const player = this.users.get(user.name);
    if (!player) throw new Error("Player not found");

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

    this.users.set(user.name, player);

    return {
      type: "move",
      data: {
        name: user.name,
        x: player.x,
        y: player.y,
        color: user.color,
      },
    };
  }

  removeUser(user: IUser): ResponseRemoveUser {
    this.users.delete(user.name);
    const player = this.users.get(user.name);

    return {
      type: "removeUser",
      data: {
        name: user.name,
        color: user.color,
        x: player?.x || 100,
        y: player?.y || 100,
      },
    };
  }

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
