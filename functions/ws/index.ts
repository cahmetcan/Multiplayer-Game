import { Game } from "../game";
import { IUser } from "../user/types";

type Player = {
  ws: WebSocket;
  data: IUser;
  room: string;
};

type Env = {
  DurableObject: DurableObjectNamespace;
  ROOMS: KVNamespace;
};

export class GameDurableObject {
  state: DurableObjectState;
  rooms: Map<string, Game>;
  users: Map<WebSocket, Player>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.rooms = new Map();
    this.users = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("room") || "";
    const name = url.searchParams.get("name") || "";

    const user: IUser = {
      name: name,
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

    return new Response(null, { status: 101, webSocket: client });
  }

  async connection(webSocket: WebSocket, roomId: string, user: IUser) {
    this.state.acceptWebSocket(webSocket, [roomId]);

    const existingUser = this.rooms.get(roomId)?.users.get(user.name);
    webSocket.send("you logged in already");

    if (!existingUser) {
      this.users.set(webSocket, {
        data: user,
        room: roomId,
        ws: webSocket,
      });
      this.rooms.get(roomId)?.addUser(user, webSocket);
    }
  }

  async webSocketMessage(ws: WebSocket, message: String | ArrayBuffer) {
    const msg = message.toString();

    const player = this.users.get(ws) as Player;

    if (msg === "getAll") {
      const game = this.rooms.get(player.room);

      if (!game) {
        return;
      }

      ws.send(JSON.stringify(game.getScores()));
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
    if (user.name === "" || user.color === "") {
      return new Response("Missing query parameters", { status: 400 });
    }
  }
}
