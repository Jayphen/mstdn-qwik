import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";

export const getPost = loader$(async ({ params }) => {
  const client = await login({ url: `https://${params.instance}` });

  const toot = await client.v1.statuses.fetch(params.id);
  const replies = (await client.v1.statuses.fetchContext(params.id))
    .descendants;

  return { toot, replies };
});

export default component$(() => {
  const signal = getPost.use();

  return (
    <div style={{ display: "grid", gap: "0.5em" }}>
      <Toots toots={[signal.value.toot]} />
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
