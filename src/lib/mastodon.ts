import type { Cookie } from "@builder.io/qwik-city";
import type { CreateClientParams, mastodon } from "masto";
import { fetchV1Instance } from "masto";
import { createClient as createMastoClient } from "masto";
import { decryptToken } from "./crypto";
import { storage } from "./storage";

export async function createClient(cookie: Cookie, paramsInstance: string) {
  const token = cookie.get("token")?.value;
  const instance = cookie.get("instance")?.value || paramsInstance;
  const url = `https://${instance}`;

  if (!token) {
    throw new Error("Invalid token");
  }

  const decryptedToken = await decryptToken(token);

  console.log(decryptedToken);

  const params =
    ((await storage.getItem(
      `servers:v0:${instance}.json`
    )) as CreateClientParams) || {};

  return createMastoClient({ ...params, url, accessToken: decryptedToken });
}

export async function createPublicClient(domain: string) {
  const url = `https://${domain}`;

  const instance = await getInstance(domain);

  return createMastoClient({
    url,
    streamingApiUrl: instance.urls.streamingApi,
    version: instance.version,
  });
}

export async function getInstance(domain: string) {
  const key = `servers:instances:v0:${domain}.json`;
  const url = `https://${domain}`;

  if (await storage.hasItem(key)) {
    return (await storage.getItem(key)) as mastodon.v1.Instance;
  }

  const instance = await fetchV1Instance({ url });

  await storage.setItem(key, instance);

  return instance;
}
