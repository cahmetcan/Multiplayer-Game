import { Game } from "../game";
import { IUser } from "../user/types";

type Env = {
  DurableObject: DurableObjectNamespace;
  ROOMS: KVNamespace;
};

export class GameDurableObject {
  state: DurableObjectState;
  rooms: Map<string, Game>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
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

    this.validateUser(user, roomId);

    const room = this.rooms.get(roomId);
    if (!room) {
      const newRoom = new Game(10);
      this.rooms.set(roomId, newRoom);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    await this.connection(server, roomId, user);

    this.rooms.get(roomId)?.moveUp(user);

    return new Response(null, { status: 101, webSocket: client });
  }

  async connection(webSocket: WebSocket, room: string, user: IUser) {
    this.state.acceptWebSocket(webSocket, [room]);
    if (this.rooms.get(room)?.users.get(user.id)) {
    }
  }

  public async validateUser(user: IUser, roomId: string) {
    /*     const isUsernameTaken = this.rooms.get(roomId)?.users.forEach((player) => {
      if (player.data.name === user.name) {
        return true;
      }
    });

    if (isUsernameTaken) {
      return new Response("Username already taken", { status: 400 });
    }
 */
    if (user.id === "" || user.name === "" || user.color === "") {
      return new Response("Missing query parameters", { status: 400 });
    }
  }
}
