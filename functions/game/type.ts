import { IUser } from "../user/types";

type IPlayer = {
  name: string;
  color: string;
  score: number;
  ws: WebSocket;
  x: number;
  y: number;
};

export { IPlayer };
