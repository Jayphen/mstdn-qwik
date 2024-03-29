import { component$ } from "@builder.io/qwik";
import { action$, Form, z, zod$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import isFQDN from "validator/lib/isFQDN";
import { createPublicClient } from "~/lib/mastodon";
import { storage } from "~/lib/storage";
import { error, form } from "./style.css";

export const useLogin = action$(
  async ({ server }, { fail, redirect }) => {
    let client: mastodon.Client;
    let oauthClient: mastodon.v1.Client;

    if (await storage.hasItem(`servers:v0:${server}`)) {
      oauthClient = (await storage.getItem(
        `servers:v0:${server}.json`
      )) as mastodon.v1.Client;
    } else {
      try {
        client = await createPublicClient(server);
      } catch (_error) {
        return fail(400, {
          message:
            "That doesn't seem like a valid Mastodon server. Please double-check!",
        });
      }

      try {
        oauthClient = await client.v1.apps.create({
          clientName: "esky-dev",
          redirectUris: `${process.env.VITE_WEBSITE}/api/${server}/oauth`,
          scopes: "read write follow",
        });
        storage.setItem(`servers:v0:${server}.json`, oauthClient);
      } catch (_error) {
        return fail(400, {
          message:
            "Could not connect to Mastodon server. Please try again later",
        });
      }
    }

    // Get redirect
    const url = new URL(`https://${server}/oauth/authorize`);
    url.searchParams.set("client_id", oauthClient.clientId || "");
    url.searchParams.set("scope", "read write follow");
    url.searchParams.set(
      "redirect_uri",
      `${process.env.VITE_WEBSITE}/api/${server}/oauth`
    );
    url.searchParams.set("response_type", "code");

    redirect(302, url.toString());
  },
  zod$({
    server: z.string().refine(isFQDN, (val) => ({
      message: `That doesn't seem like a valid domain. It should look something like ${
        val.replace("@", "").split(".")[0]
      }.com`,
    })),
  })
);

export default component$(() => {
  const action = useLogin();

  return (
    <>
      <Form action={action} class={form}>
        <label for="server">At which server to you own an account?</label>
        <div>
          <input
            type="text"
            autoComplete="off"
            name="server"
            id="server"
            required
          />
          <button type="submit">Submit</button>
        </div>
        {action.value?.failed && (
          <div class={error} role="alert">
            <p>It looks like there are some errors:</p>
            <ul>
              <li>{action.value.message}</li>
            </ul>
          </div>
        )}
        {action.value?.fieldErrors?.server && (
          <div class={error} role="alert">
            <p>It looks like there are some errors:</p>
            <ul>
              {action.value.fieldErrors.server.map((err) => (
                <li>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </Form>
    </>
  );
});
