import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (ev) => {
  throw ev.redirect(302, "/front-end.social/public");
};
