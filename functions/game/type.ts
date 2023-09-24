import { IUser } from "../user/types";

type IPlayer = {
  data: IUser;
  score: number;
  ws: WebSocket;
  x: number;
  y: number;
};

export { IPlayer };
