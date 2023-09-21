import { Game } from "../game";
import { IUser } from "../user/types";

export class DurableObject {
  state: DurableObjectState;
  users: Map<WebSocket, IUser>;
  rooms: Map<string, Game>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.users = new Map();
    this.rooms = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("room") || "";

    const user: IUser = {
      id: crypto.randomUUID(),
      name: url.searchParams.get("name") || "",
      color: url.searchParams.get("color") || "",
    };
    this.validateUser(user);

    const room = this.rooms.get(roomId);
    if (!room) {
      this.rooms.set(roomId, new Game(5));
    }
  }

  public async validateUser(user: IUser) {
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.name === user.name
    );

    if (existingUser) {
      return new Response("Username already taken", { status: 400 });
    }
    if (user.id === "" || user.name === "" || user.color === "") {
      return new Response("Missing query parameters", { status: 400 });
    }
  }
}
