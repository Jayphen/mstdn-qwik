import {
  component$,
  useClientEffect$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";

export const getPublicToots = loader$(async () => {
  const client = await login({ url: `https://front-end.social` });

  //todo: set the max in a session cookie. Limit fetches to that max to avoid
  // reflows when going fwd/back
  return client.v1.timelines.listPublic();
});

export default component$(() => {
  const signal = getPublicToots.use();
  const unshownPosts = useSignal<mastodon.v1.Status[]>([]);
  const shownPosts = useSignal<mastodon.v1.Status[]>([]);
  const shouldFetchMore = useSignal(false);
  const toots = useSignal(signal.value);

  useClientEffect$(
    () => {
      const source = new EventSource("/api/posts/public-stream");

      function updateUnshown(message: MessageEvent<string>) {
        const parsed = JSON.parse(message.data);
        const isNew = +parsed.id > +toots.value[0].id;

        if (!parsed.init && isNew) {
          unshownPosts.value = [...unshownPosts.value, parsed];
        }
      }

      source.addEventListener("message", updateUnshown);

      () => source.removeEventListener("message", updateUnshown);
    },
    { eagerness: "idle" }
  );

  useClientEffect$(async ({ track }) => {
    track(() => shouldFetchMore.value);

    if (shouldFetchMore.value) {
      shouldFetchMore.value = false;

      shownPosts.value = [...unshownPosts.value, ...shownPosts.value];
      unshownPosts.value = [];
    }
  });

  useTask$(({ track }) => {
    track(() => shownPosts.value);
    toots.value = [...shownPosts.value, ...signal.value];
  });

  return (
    <>
      {unshownPosts.value.length > 0 && (
        <button onClick$={() => (shouldFetchMore.value = true)}>
          Load {unshownPosts.value.length} new posts
        </button>
      )}
      <Toots toots={toots.value} />
    </>
  );
});

export const head: DocumentHead = {
  title: "Esky",
  meta: [
    {
      name: "description",
      content: "A mastadon client",
    },
  ],
};
