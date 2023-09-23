import { Hono } from "hono";
import { IUser } from "./user/types";
export { GameDurableObject } from "./ws";

type Bindings = {
  DurableObject: DurableObjectNamespace;
  ROOMS: KVNamespace;
};

declare module "hono" {
  interface HonoRequest {
    user?: IUser;
  }
}

const app = new Hono<{ Bindings: Bindings }>();

/* 
play game endpoint
get available rooms endpoints
get user data endpoint
*/

app.get("/play/:room", async (c) => {
  try {
    const { DurableObject, ROOMS } = c.env;
    const room = c.req.param("room");

    if (!room) return new Response("Missing room id", { status: 400 });

    const DurableObjectId = DurableObject.idFromName(room);
    const DurableObjectStub = DurableObject.get(DurableObjectId);

    if (!(await ROOMS.get(room))) ROOMS.put(room, DurableObjectId.toString());

    if (c.req.header("upgrade") !== "websocket")
      return new Response("Not a websocket request", { status: 400 });
    const request = new Request(c.req.url, {
      headers: c.req.header(),
    });

    return DurableObjectStub.fetch(request);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

app.get("/rooms", async (c) => {
  // TODO: add prefix search
  try {
    const { ROOMS } = c.env;

    const rooms = await ROOMS.list({
      prefix: "",
    });

    return new Response(JSON.stringify(rooms.keys), {
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

export default app;
