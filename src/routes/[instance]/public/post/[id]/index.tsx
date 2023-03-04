import { component$ } from "@builder.io/qwik";
import { loader$, useLocation } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { Reply } from "~/components/reply/reply";
import { Toots } from "~/components/toots/toots";
import { createClient, createPublicClient } from "~/lib/mastodon";

export const getPost = loader$(async (context) => {
  const { params, cookie, query } = context;
  const client = await createPublicClient(params.instance);

  // todo: fix this logic
  const isRemote = params.instance !== cookie.get("instance")?.value;
  const token = cookie.get("token")?.value;

  const isInteractingRemotely =
    token && isRemote && query.get("interactRemotely");
  const couldInteractRemotely =
    token && isRemote && !query.get("interactRemotely");
  const isInteractingLocally =
    token && params.instance === cookie.get("instance")?.value;

  const toot = await client.v1.statuses.fetch(params.id);
  const replies = (await client.v1.statuses.fetchContext(params.id))
    .descendants;

  let tootViaLocalContext: mastodon.v1.Status | undefined;

  if (!isInteractingRemotely) {
    tootViaLocalContext = undefined;
  } else {
    const client = await createClient(context);

    const url = toot.reblog?.url || toot.url;
    const searchResult = await client.v2.search({
      q: encodeURI(url!),
      resolve: true,
      limit: 1,
    });

    const status = searchResult.statuses[0];

    tootViaLocalContext = status;
  }

  return {
    toot,
    replies,
    tootViaLocalContext,
    isInteractingRemotely,
    couldInteractRemotely,
    isInteractingLocally,
  };
});

export default component$(() => {
  const signal = getPost();
  const loc = useLocation();

  const toot = signal.value.tootViaLocalContext || signal.value.toot;
  const isInteracting =
    signal.value.isInteractingRemotely || signal.value.isInteractingLocally;

  return (
    <div style={{ display: "grid", gap: "0.5em" }}>
      <Toots toots={[toot]} />
      {isInteracting && <Reply tootId={toot.id} />}
      {signal.value.couldInteractRemotely && (
        <a href="?interactRemotely=true">
          Would you like to comment on this remote post? Since it's not part of
          your home server, it will take a moment to connect you to{" "}
          {loc.params.instance}
        </a>
      )}
      {toot.repliesCount > 0 && (
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
