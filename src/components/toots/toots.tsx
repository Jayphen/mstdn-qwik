import { component$ } from "@builder.io/qwik";
import type { mastodon } from "masto";
import { Toot } from "../toot/toot";
import { toots as tootsStyle } from "./toots.css";

export const Toots = component$((props: { toots: mastodon.v1.Status[] }) => {
  return (
    <ul class={tootsStyle}>
      {props.toots.map((toot) => (
        <Toot toot={toot} key={toot.id} />
      ))}
    </ul>
  );
});
