import { component$ } from "@builder.io/qwik";
import { action$, Form } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { createClient } from "~/lib/mastodon";
import { useLoggedIn } from "~/routes/layout";
import { favButton, faved } from "./fav.style.css";

export const useFav = action$(async (form, ev) => {
  const client = await createClient(ev);
  const id = form.id.toString();
  const faved = form.faved.toString() === "true";

  return faved
    ? await client.v1.statuses.unfavourite(id)
    : await client.v1.statuses.favourite(id);
});

export const Fav = component$((props: { toot: mastodon.v1.Status }) => {
  const loggedIn = useLoggedIn();
  const count = props.toot.favouritesCount;
  const action = useFav();

  return (
    <>
      {loggedIn.value ? (
        <Form action={action}>
          <input type="hidden" name="id" value={props.toot.id} />
          <input
            type="hidden"
            name="faved"
            value={props.toot.favourited ? "true" : "false"}
          />
          <button
            class={props.toot.favourited ? faved : favButton}
            type="submit"
            disabled={action.isRunning}
          >
            <span>⭐ {count}</span>
          </button>
        </Form>
      ) : (
        <span>⭐ {count}</span>
      )}
    </>
  );
});
