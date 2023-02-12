import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";

export const getPost = loader$(async ({ params }) => {
  const client = await login({ url: `https://${params.instance}` });

  return client.v1.statuses.fetch(params.id);
});

export default component$(() => {
  const signal = getPost.use();

  return <Toots toots={[signal.value]} />;
});
