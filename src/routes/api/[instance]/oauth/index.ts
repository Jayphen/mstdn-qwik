import type { RequestHandler } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { encryptToken } from "~/lib/crypto";
import { storage } from "~/lib/storage";

export const onGet: RequestHandler = async (ev) => {
  const instance = ev.params.instance;
  const app = (await storage.getItem(
    `servers:v0:${instance}.json`
  )) as mastodon.v1.Client;

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

  const encryptedToken = await encryptToken(token.access_token);

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 12);

  ev.cookie.set("token", encryptedToken, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires,
  });

  ev.cookie.set("instance", instance, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires,
  });

  throw ev.redirect(302, `/${instance}/local/`);
};
