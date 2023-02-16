import { component$ } from "@builder.io/qwik";
import { action$, Form, z, zod$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { login } from "masto";
import isFQDN from "validator/lib/isFQDN";
import { error, form } from "./style.css";

export const appStore: Map<string, mastodon.v1.Client> = new Map();

export const useLogin = action$(
  async ({ server }, { fail }) => {
    let masto: mastodon.Client;

    try {
      masto = await login({ url: `https://${server}` });
    } catch (_error) {
      return fail(400, {
        message:
          "That doesn't seem like a valid Mastodon server. Please double-check!",
      });
    }

    try {
      const app = await masto.v1.apps.create({
        clientName: "esky-dev",
        redirectUris: "http://localhost:5173/api/oauth",
        scopes: "read write follow",
      });

      appStore.set(server, app);

      return { success: "Looks good! Redirecting you to auth…" };
    } catch (_error) {
      return fail(400, {
        message: "Could not connect to Mastodon server. Please try again later",
      });
    }
  },
  zod$({
    server: z.string().refine(isFQDN, (val) => ({
      message: `That doesn't seem like a valid domain. It should look something like ${val.replace("@", "").split(".")[0]
        }.com`,
    })),
  })
);

export default component$(() => {
  const action = useLogin();

  return (
    <>
      {action.value?.success ? (
        <div>{action.value.success}</div>
      ) : (
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
      )}
    </>
  );
});
