import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";

export const getPublicToots = loader$(async ({ params }) => {
  const client = await login({ url: `https://${params.instance}` });

  const toots = await client.v1.timelines.listPublic({
    limit: 20,
    maxId: params.maxId,
    local: true,
  });
  const next = await client.v1.timelines.listPublic({
    limit: 20,
    minId: toots[1].id,
    local: true,
  });

  return { toots, next };
});

export default component$(() => {
  const {
    value: { next, toots },
  } = getPublicToots.use();

  return (
    <>
      <Toots toots={toots} />

      <a
        href={`../${toots[toots.length - 1].id}`}
        style={{ padding: "0.25em", background: "white" }}
      >
        Prev page
      </a>

      {next.length === 20 ? (
        <a
          href={`../${next[0].id}`}
          style={{ padding: "0.25em", background: "white" }}
        >
          Next page
        </a>
      ) : next.length ? (
        <a
          href={`../?min=${next[0].id}`}
          style={{ padding: "0.25em", background: "white" }}
        >
          Next page
        </a>
      ) : (
        <>You're all caught up!</>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "Esky",
  meta: [
    {
      name: "description",
      content: "A mastodon client",
    },
  ],
};
