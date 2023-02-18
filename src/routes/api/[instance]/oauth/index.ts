import type { RequestHandler } from "@builder.io/qwik-city";
import { appStore } from "~/routes/login";

export const onGet: RequestHandler = async (ev) => {
  const instance = ev.params.instance;
  const app = appStore.get(instance);

  if (!app) {
    throw ev.redirect(302, "/login/");
  }

  const url = ev.url;
  const code = url.searchParams.get("code");

  if (!code) throw "Missing code";

  const body = new FormData();

  body.set("client_id", app.clientId!);
  body.set("client_secret", app.clientSecret!);
  body.set("redirect_uri", `${process.env.VITE_WEBSITE}/api/${instance}/oauth`);
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("scope", "read write follow");

  const resp = await fetch(`https://${instance}/oauth/token`, {
    method: "POST",
    body,
  });

  if (resp.status !== 200) {
    const result = await resp.text();
    throw new Error(result);
  }

  const token = await resp.json();

  ev.cookie.set("token", token.access_token, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  });

  throw ev.redirect(302, `/${instance}/local/`);
};
