import { Hono } from "hono";
import { IUser } from "./user/types";
export { GameDurableObject } from "./ws";
import { cors } from "hono/cors";

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


app.get("/play", async (c) => {
  try {
    const { DurableObject, ROOMS } = c.env;
    const userCountry = c.req.raw.cf?.country as string;

    const DurableObjectId = DurableObject.idFromName(userCountry);
    const DurableObjectStub = DurableObject.get(DurableObjectId);

    if (!(await ROOMS.get(userCountry)))
      ROOMS.put(userCountry, DurableObjectId.toString());

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

app.get("*", cors());

app.get("/servers", async (c) => {
  // TODO: add prefix search
  try {
    const { ROOMS, DurableObject } = c.env;
    const userCountry = c.req.raw.cf?.country as string;
    const DurableObjectId = DurableObject.idFromName(userCountry);
    const DurableObjectStub = DurableObject.get(DurableObjectId);

    const rooms = await ROOMS.list({
      prefix: "",
    });

    return c.json({
      rooms: JSON.stringify(rooms.keys),
      userData: c.req.raw.cf?.country,
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

export default app;
