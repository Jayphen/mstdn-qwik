import type { RequestHandler } from "@builder.io/qwik-city";
import { createClient } from "~/lib/mastodon";

export const onGet: RequestHandler = async (ev) => {
  if (ev.cookie.get("token")?.value) {
    const client = await createClient(ev.cookie, ev.params.instance);

    const user = await client.v1.accounts.verifyCredentials();

    const url = new URL(user.url);

    throw ev.redirect(302, `/${url.hostname}/home`);
  } else {
    throw ev.redirect(302, "/front-end.social/public");
  }
};
