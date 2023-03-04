import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import { Toots } from "~/components/toots/toots";
import { createClient } from "~/lib/mastodon";

export const useGetBookmarks = loader$(async function(ev) {
  const client = await createClient(ev);

  return client.v1.bookmarks.list();
});

export default component$(() => {
  const bookmarks = useGetBookmarks().value;

  return <Toots toots={bookmarks} />;
});
