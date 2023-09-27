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

  constructor(state: DurableObjectState) {
    this.state = state;
    this.rooms = new Map();
    this.users = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("room") || "";
    const name = url.searchParams.get("name") || "";
    console.log("new fetch", roomId, name);

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

    console.log("new connection", roomId, user);
    setInterval(() => {
      const game = this.rooms.get(roomId);
      if (!game) {
        return;
      }

      const scores = game.getScores();
      const message = JSON.stringify({
        type: "scores",
        data: scores,
      });

      const users = JSON.stringify(game.userCoordinates());

      this.broadcast(roomId, message);
      this.broadcast(roomId, users);
    }, 1000);

    const existingUser = this.rooms.get(roomId)?.users.get(user.name);

    if (!existingUser) {
      this.users.set(webSocket, {
        data: user,
        room: roomId,
        ws: webSocket,
      });
      this.rooms.get(roomId)?.addUser(user, webSocket);
      webSocket.send(
        JSON.stringify(this.rooms.get(roomId)?.users.get(user.name))
      );
    }
  }

  async webSocketMessage(ws: WebSocket, message: String | ArrayBuffer) {
    const msg = message.toString();
    console.log("new messaage", msg);

    const player = this.users.get(ws) as Player;

    if (msg === "getAll") {
      const game = this.rooms.get(player.room);

      if (!game) {
        return;
      }

      ws.send(JSON.stringify(game.getScores()));
    }

    if (msg === "rooms") {
      const rooms = Array.from(this.rooms.keys());
      console.log("rooms", rooms);
      ws.send(JSON.stringify(rooms));
    }

    if (msg === "w") {
      console.log("move up");
      this.rooms.get(player.room)?.moveUp(player.data);

      ws.send(
        JSON.stringify(this.rooms.get(player.room)?.users.get(player.data.name))
      );
    }

    if (msg === "s") {
      console.log("move down");
      this.rooms.get(player.room)?.moveDown(player.data);

      ws.send(
        JSON.stringify(this.rooms.get(player.room)?.users.get(player.data.name))
      );
    }

    if (msg === "a") {
      console.log("move left");
      this.rooms.get(player.room)?.moveLeft(player.data);

      ws.send(
        JSON.stringify(this.rooms.get(player.room)?.users.get(player.data.name))
      );
    }

    if (msg === "d") {
      console.log("move right");
      this.rooms.get(player.room)?.moveRight(player.data);

      ws.send(
        JSON.stringify(this.rooms.get(player.room)?.users.get(player.data.name))
      );
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    const player = this.users.get(ws) as Player;
    const game = this.rooms.get(player.room);

    if (!game) return;

    ws.send(
      JSON.stringify({
        type: "Your score is deleted",
        user: player.data.name,
        score: game.users.get(player.data.name)?.score,
        code,
        closeReason: reason,
        wasClean,
      })
    );
    if (wasClean === true) {
      game.removeUser(player.data);
      this.users.delete(ws);
    }
  }

  async webSocketError(ws: WebSocket, error: any) {
    console.log("error", error);

    const player = this.users.get(ws) as Player;
    const game = this.rooms.get(player.room);

    if (!game) return;

    game.removeUser(player.data);
    this.users.delete(ws);
  }

  async broadcast(roomId: string, message: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.users.forEach((player) => {
      player.ws.send(message);
    });
  }
  public async validateUser(user: IUser, roomId: string) {
    /*     const isUsernameTaken = this.rooms.get(roomId)?.users.forEach((player) => {
      if (player.data.name  === user.name) {
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
