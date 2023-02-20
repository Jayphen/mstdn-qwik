import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useUserDetail } from "~/routes/layout";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const user = useUserDetail();
  const loc = useLocation();

  const userHost = user.value ? new URL(user.value.url).hostname : null;

  return (
    <>
      {user.value ? (
        <div class="loggedIn">
          Logged in as @{user.value.acct}@{userHost}
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
      <header>
        {loc.params.instance && (
          <>
            {loc.url.pathname.includes("home") ? (
              <span>You're viewing your home feed</span>
            ) : (
              <span>
                You're viewing the {loc.params.instance}{" "}
                {loc.pathname.includes("local") ? "local" : "public"} feed.
              </span>
            )}
            <ul>
              {user.value && (
                <li>
                  <a href={`/${userHost}/home`}> Home</a>
                </li>
              )}
              <li>
                <a
                  href={`/${loc.params.instance}/public`}
                  title={`Posts from ${loc.params.instance}, and all the other instances it knows about`}
                >
                  Federated feed
                </a>
                <a
                  href={`/${loc.params.instance}/local`}
                  title={`Posts only from ${loc.params.instance}`}
                >
                  Local feed
                </a>
              </li>
            </ul>
          </>
        )}
      </header>
    </>
  );
});
