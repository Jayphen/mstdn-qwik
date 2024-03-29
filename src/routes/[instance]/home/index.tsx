import { component$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import { Toots } from "~/components/toots/toots";
import { createClient } from "~/lib/mastodon";

export const onGet: RequestHandler = async (ev) => {
  ev.headers.set(
    "Cache-Control",
    "private, stale-while-revalidate=120, max-age=1"
  );
};

export const getHomeFeed = loader$(async (ev) => {
  if (!ev.cookie.get("token")?.value) {
    throw ev.redirect(301, "/login");
  }

  const client = await createClient(ev);

  try {
    return client.v1.timelines.listHome({ limit: 20 });
  } catch (e: any) {
    return null;
  }
});

export default component$(() => {
  const toots = getHomeFeed();

  return <>{toots.value ? <Toots toots={toots.value} /> : "oh no"}</>;
});
