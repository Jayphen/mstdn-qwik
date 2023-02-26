import type { Cookie } from "@builder.io/qwik-city";
import type { CreateClientParams, mastodon } from "masto";
import { fetchV1Instance } from "masto";
import { createClient as createMastoClient } from "masto";
import { decryptToken } from "./crypto";
import { storage } from "./storage";

export async function createClient(cookie: Cookie, paramsInstance: string) {
  const jwe = cookie.get("token")?.value;

  if (!jwe) {
    throw new Error("Invalid token");
  }

  try {
    const jwt = JSON.parse(await decryptToken(jwe));

    const instance = jwt.instance || paramsInstance;
    const url = `https://${instance}`;

    const params =
      ((await storage.getItem(
        `servers:v0:${instance}.json`
      )) as CreateClientParams) || {};

    return createMastoClient({ ...params, url, accessToken: jwt.token });
  } catch (e) {
    throw new Error("token_invalid");
  }
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
