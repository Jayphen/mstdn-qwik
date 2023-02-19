import type { Cookie } from "@builder.io/qwik-city";
import type { CreateClientParams } from "masto";
import { createClient as createMastoClient } from "masto";
import { storage } from "./storage";

export async function createClient(cookie: Cookie, paramsInstance: string) {
  const token = cookie.get("token")?.value;
  const instance = cookie.get("instance")?.value || paramsInstance;

  const params = ((await storage.getItem(
    `servers:v0:${instance}`
  )) as CreateClientParams) || { url: `https://${paramsInstance}` };

  return createMastoClient({ ...params, accessToken: token });
}

export async function createPublicClient(instance: string) {
  return createMastoClient({ url: `https://${instance}` });
}
