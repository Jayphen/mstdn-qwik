import type { RequestHandler } from "@builder.io/qwik-city";
import { createClient } from "~/lib/mastodon";

export const onGet: RequestHandler = async (ev) => {
  if (ev.cookie.get("token")?.value) {
    try {
      const client = await createClient(ev);

      const user = await client.v1.accounts.verifyCredentials();

      const url = new URL(user.url);

      throw ev.redirect(302, `/${url.hostname}/home`);
    } catch (e) {
      ev.cookie.delete("token");
      throw ev.redirect(302, "/front-end.social/public");
    }
  } else {
    throw ev.redirect(302, "/front-end.social/public");
  }
};
