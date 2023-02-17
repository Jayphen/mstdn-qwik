import type { RequestHandler } from "@builder.io/qwik-city";
import type { mastodon } from "masto";

export const onGet: RequestHandler = async (ev) => {
  const appCookie = ev.cookie.get("server")?.value;
  const instance = ev.params.instance;

  if (!appCookie) {
    throw ev.redirect(302, "/login/");
  }

  const app: mastodon.v1.Client = JSON.parse(decodeURIComponent(appCookie!));
  const url = ev.url;
  const code = url.searchParams.get("code");

  if (!code) throw "Missing code";

  const body = new FormData();

  body.set("client_id", app.clientId!);
  body.set("client_secret", app.clientSecret!);
  body.set("redirect_uri", `http://localhost:5173/api/${instance}/oauth`);
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
