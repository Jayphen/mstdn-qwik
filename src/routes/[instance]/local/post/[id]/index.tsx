import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { Reply } from "~/components/reply/reply";
import { Toots } from "~/components/toots/toots";
import { createClient } from "~/lib/mastodon";

export const useGetPost = loader$(async ({ params, cookie }) => {
  const client = await createClient(cookie, params.instance);

  const toot = await client.v1.statuses.fetch(params.id);
  const replies = (await client.v1.statuses.fetchContext(params.id))
    .descendants;

  return { toot, replies };
});

export default component$(() => {
  const signal = useGetPost();

  return (
    <div style={{ display: "grid", gap: "0.5em" }}>
      <Toots toots={[signal.value.toot]} />
      <Reply />
      {signal.value.toot.repliesCount > 0 && (
        <div style={{ fontSize: "0.875em", marginLeft: "1em" }}>
          <h2>Replies</h2>
          <Replies replies={signal.value.replies} />
        </div>
      )}
    </div>
  );
});

export const Replies = component$(
  (props: { replies: mastodon.v1.Status[] }) => {
    return <Toots toots={props.replies} />;
  }
);
