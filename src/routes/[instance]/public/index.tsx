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

export const getPublicToots = loader$(async ({ params }) => {
  const client = await login({ url: `https://${params.instance}` });

  return client.v1.timelines.listPublic();
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

        if (+unshownFromStorage[0] < +toots.value[0].id) {
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
        const isNew = +message.data > +toots.value[0].id;
        console.log(unshownPosts.value);

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
        <button
          onClick$={() => {
            localStorage.setItem("unshown", "");
            window.location.reload();
          }}
        >
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
