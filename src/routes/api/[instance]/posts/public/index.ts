import type { RequestHandler } from "@builder.io/qwik-city";
import { login } from "masto";

export const onGet: RequestHandler = async (ev) => {
  const minId = ev.query.get("min");

  const client = await login({ url: `https://${ev.params.instance}` });

  const posts = await client.v1.timelines.listPublic({ minId, limit: 40 });

  ev.json(200, posts);
};
