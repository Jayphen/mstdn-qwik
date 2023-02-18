import { createClient as createMastoClient } from "masto";
import { appStore } from "~/routes/login";

export async function createClient(opts: { instance: string, token?: string }) {
  const params = appStore.get(opts.instance)

  if (!params) {
    throw new Error("Instance is not registered")
  }

  return createMastoClient({ ...params, accessToken: opts.token })
}
