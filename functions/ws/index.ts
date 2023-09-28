import { Directions, Game } from "../game";
import { IUser } from "../user/types";

type Inputs = {
  type: string;
  data?: any;
};

type Player = {
  ws: WebSocket;
  data: IUser;
  room: string;
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

    const user: IUser = {
      name: name,
      color: url.searchParams.get("color") || "",
    };

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
    const game = this.rooms.get(roomId);
    if (!game) return;
/*     if (game.status === "ended") {
      webSocket.send("This game has already ended");
      return webSocket.close();
    } */
    this.users.set(webSocket, { ws: webSocket, data: user, room: roomId });

    if (game.users.has(user.name)) {
      webSocket.send("This name is already taken");
      return webSocket.close();
    }

    const allCoordinatesAnnouncement = game.userCoordinates();
    webSocket.send(JSON.stringify(allCoordinatesAnnouncement));

    const newUserAnnouncement = game.addUser(user, webSocket);
    this.broadcast(roomId, JSON.stringify(newUserAnnouncement));
  }

  async webSocketMessage(ws: WebSocket, message: String | ArrayBuffer) {
    const input = message.toString();
    const msg = JSON.parse(input) as Inputs;
    const player = this.users.get(ws) as Player;
    const game = this.rooms.get(player.room);
    if (!game) return;

    if (msg.type === "move" && Object.values(Directions).includes(msg.data)) {
      game.move(player.data, msg.data);
      const user = game.getUser(player.data.name);
      ws.send(JSON.stringify(user?.name));
      if (!user) return;

      const moveAnnouncement = game.move(player.data, msg.data);
      this.broadcast(player.room, JSON.stringify(moveAnnouncement));
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    ws.send("You have been disconnected");
    const player = this.users.get(ws) as Player;
    const game = this.rooms.get(player.room);
    const room = player.room;
    if (!game) return;

    const removeUserAnnouncement = game.removeUser(player.data);
    this.broadcast(room, JSON.stringify(removeUserAnnouncement));

    this.users.delete(ws);
    if (game.users.size === 0) {
      game.users.clear();
      game.status = "ended";
      this.rooms.delete(player.room);
    }
  }

  async webSocketError(ws: WebSocket, error: any) {
    console.log("error", error);

    const player = this.users.get(ws) as Player;
    const game = this.rooms.get(player.room);

    if (!game) return;

    game.removeUser(player.data);
    this.users.delete(ws);
    const removeUserAnnouncement = game.removeUser(player.data);
    this.broadcast(player.room, JSON.stringify(removeUserAnnouncement));
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
}
