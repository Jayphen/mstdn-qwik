import { component$ } from "@builder.io/qwik";
import type { CookieOptions } from "@builder.io/qwik-city";
import { action$, Form, z, zod$ } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import { login } from "masto";
import isFQDN from "validator/lib/isFQDN";
import { error, form } from "./style.css";

export const appStore: Map<string, mastodon.v1.Client> = new Map();

export const useLogin = action$(
  async ({ server }, { fail, cookie, redirect }) => {
    let masto: mastodon.Client;
    let app: mastodon.v1.Client;
    const cookieConfig: CookieOptions = {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "lax",
    };

    if (appStore.has(server)) {
      app = appStore.get(server)!;
      cookie.set(
        "server",
        encodeURIComponent(JSON.stringify(app)),
        cookieConfig
      );
      console.log({ cachedServer: server });
    } else {
      try {
        masto = await login({ url: `https://${server}` });
      } catch (_error) {
        return fail(400, {
          message:
            "That doesn't seem like a valid Mastodon server. Please double-check!",
        });
      }

      try {
        console.log({ server });
        app = await masto.v1.apps.create({
          clientName: "esky-dev",
          redirectUris: `http://localhost:5173/api/${server}/oauth`,
          scopes: "read write follow",
        });

        appStore.set(server, app);

        cookie.set(
          "server",
          encodeURIComponent(JSON.stringify(app)),
          cookieConfig
        );
      } catch (_error) {
        return fail(400, {
          message:
            "Could not connect to Mastodon server. Please try again later",
        });
      }
    }

    console.log({ id: app.clientId, secret: app.clientSecret });

    // Get redirect
    const url = new URL(`https://${server}/oauth/authorize`);
    url.searchParams.set("client_id", app.clientId || "");
    url.searchParams.set("scope", "read write follow");
    url.searchParams.set(
      "redirect_uri",
      `http://localhost:5173/api/${server}/oauth`
    );
    url.searchParams.set("response_type", "code");

    redirect(302, url.toString());
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
