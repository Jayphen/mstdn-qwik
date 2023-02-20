import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (ev) => {
  if (ev.cookie.get("token")?.value) {
    throw ev.redirect(302, "/home");
  } else {
    throw ev.redirect(302, "/front-end.social/public");
  }
};
