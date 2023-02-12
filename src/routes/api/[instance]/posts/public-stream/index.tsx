import type { RequestHandler } from "@builder.io/qwik-city";
import { login } from "masto";

export const onGet: RequestHandler = async (ev) => {
  ev.headers.set("Access-Control-Allow-Origin", "*");
  ev.headers.set("connection", "keep-alive");
  ev.headers.set("Content-Type", "text/event-stream");
  ev.headers.set("Cache-Control", "no-cache, no-transform");

  ev.status(200);

  const writableStream = ev.getWritableStream();

  const writer = writableStream.getWriter();

  const client = await login({ url: `https://${ev.params.instance}` });

  const stream = await client.v1.stream.streamPublicTimeline();

  const encoder = new TextEncoder();

  // we need an empty write to kick things off?
  writer.write(encoder.encode(`data: ${JSON.stringify({ init: true })}\n\n`));

  stream.addListener("update", (e) => {
    const data = `data: ${JSON.stringify(e)}\n\n`;
    const encoded = encoder.encode(data);
    writer.write(encoded);
  });
};
