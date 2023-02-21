import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useUserDetail } from "~/routes/layout";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const user = useUserDetail();
  const loc = useLocation();

  const userHost = user.value ? new URL(user.value.url).hostname : null;

  const instance = loc.params.instance || userHost;

  return (
    <>
      {user.value ? (
        <div class="loggedIn">
          <span>
            Logged in as @{user.value.acct}@{userHost}
          </span>
          <a href="/bookmarks">Bookmarks</a>
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
      <header>
        {instance && (
          <>
            {loc.url.pathname.includes("home") && (
              <span>You're viewing your home feed</span>
            )}

            {loc.url.pathname.includes(instance) &&
              !loc.url.pathname.includes("home") && (
                <span>
                  You're viewing the {instance}{" "}
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
                  href={`/${instance}/public`}
                  title={`Posts from ${instance}, and all the other instances it knows about`}
                >
                  Federated feed
                </a>
                <a
                  href={`/${instance}/local`}
                  title={`Posts only from ${instance}`}
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
