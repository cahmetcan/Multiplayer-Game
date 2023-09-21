import { IUser } from "../user/types";

export class DurableObject {
  state: DurableObjectState;
  users: Map<WebSocket, IUser>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.users = new Map();
  }
}
