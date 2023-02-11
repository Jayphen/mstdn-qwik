import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { loader$ } from "@builder.io/qwik-city";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";

export const getPublicToots = loader$(async () => {
  const client = await login({ url: `https://front-end.social` });

  return client.v1.timelines.listPublic();
});

export default component$(() => {
  const signal = getPublicToots.use();

  return <Toots toots={signal.value} />;
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
