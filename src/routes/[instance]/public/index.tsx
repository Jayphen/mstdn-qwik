import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import { Toots } from "~/components/toots/toots";
import { isBrowser } from "@builder.io/qwik/build";
import { createClient, createPublicClient } from "~/lib/mastodon";

export const onGet: RequestHandler = async (ev) => {
  ev.headers.set(
    "Cache-Control",
    "private, stale-while-revalidate=120, max-age=1"
  );
};

// what if we would have a chronological feed, where the oldest posts are at the top
// with pagination. old posts disappear after you've read them. you could still paginate
// back
export const getPublicToots = loader$(async ({ params, query, cookie }) => {
  const client =
    params.instance === cookie.get("instance")?.value
      ? await createClient(cookie, params.instance)
      : await createPublicClient(params.instance);

  try {
    return await client.v1.timelines.listPublic({
      limit: 20,
      minId: query.get("min"),
    });
  } catch (e: any) {
    return e.message;
  }
});

export default component$(() => {
  const loc = useLocation();
  const signal = getPublicToots();
  const unshownPosts = useSignal<string[]>([]);
  const toots = useSignal(typeof signal.value === "object" && signal.value);

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

  useBrowserVisibleTask$(
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
    { strategy: "document-idle" }
  );

  return (
    <>
      {toots.value.length ? (
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
          <a
            href={`${toots.value[toots.value.length - 1].id}`}
            style={{ padding: "0.25em", background: "white" }}
          >
            Prev page
          </a>
        </>
      ) : (
        <>"oh no"</>
      )}
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
