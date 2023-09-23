import { Game } from "../game";
import { IUser } from "../user/types";

export class GameDurableObject {
  state: DurableObjectState;
  users: Map<WebSocket, IUser>;
  roomId: number;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.users = new Map();
    this.roomId = Math.floor(Math.random() * 10000);
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

    if (roomId) {
      
    }

    const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		return new Response(null, { status: 101, webSocket: client });
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
