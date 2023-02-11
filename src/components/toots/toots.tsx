import type { mastodon } from "masto";
import { Toot } from "../toot/toot";
import { toots as tootsStyle } from "./toots.css";

export function Toots({ toots }: { toots: mastodon.v1.Status[] }) {
  return (
    <ul class={tootsStyle}>
      {toots.map((toot) => (
        <Toot toot={toot} />
      ))}
    </ul>
  );
}
