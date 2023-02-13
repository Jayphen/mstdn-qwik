import {
  component$,
  useClientEffect$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";
import { isBrowser } from "@builder.io/qwik/build";

export const onGet: RequestHandler = async (ev) => {
  ev.headers.set(
    "Cache-Control",
    "private, stale-while-revalidate=120, max-age=1"
  );
};

// what if we would have a chronological feed, where the oldest posts are at the top
// with pagination. old posts disappear after you've read them. you could still paginate
// back
export const getPublicToots = loader$(async ({ params, query }) => {
  const client = await login({ url: `https://${params.instance}` });

  return await client.v1.timelines.listPublic({
    limit: 40,
    minId: query.get("min"),
  });
});

export default component$(() => {
  const loc = useLocation();
  const signal = getPublicToots.use();
  const unshownPosts = useSignal<string[]>([]);
  const toots = useSignal(signal.value);

  useTask$(
    () => {
      if (isBrowser && localStorage.getItem("unshown")) {
        const unshownFromStorage = JSON.parse(
          localStorage.getItem("unshown") as string
        );

        if (
          unshownFromStorage[unshownFromStorage.length - 1] <=
          toots.value[0].createdAt
        ) {
          localStorage.setItem("unshown", "");
        } else {
          unshownPosts.value = unshownFromStorage;
        }
      }
    },
    { eagerness: "load" }
  );

  useClientEffect$(
    () => {
      const source = new EventSource(
        `/api/${loc.params.instance}/posts/public-stream`
      );

      function updateUnshown(message: MessageEvent<string>) {
        const isNew = message.data > toots.value[0].createdAt;

        if (isNew) {
          unshownPosts.value = [...unshownPosts.value, message.data];
          localStorage.setItem(
            "unshown",
            `${JSON.stringify(unshownPosts.value)}`
          );
        }
      }

      source.addEventListener("message", updateUnshown);

      () => source.removeEventListener("message", updateUnshown);
    },
    { eagerness: "idle" }
  );

  return (
    <>
      {unshownPosts.value.length > 0 && (
        <a
          href={loc.pathname}
          onClick$={() => {
            localStorage.setItem("unshown", "");
          }}
        >
          Load {unshownPosts.value.length} new posts
        </a>
      )}
      <Toots toots={toots.value} />
      <a href={`${toots.value[toots.value.length - 1].id}`}>Prev 40</a>
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
