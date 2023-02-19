import { component$, Resource } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import { Toots } from "~/components/toots/toots";
import { createClient, createPublicClient } from "~/lib/mastodon";
import { useLoggedIn } from "~/routes/layout";
import { meta } from "./index.css";

// When browsing an alien instance, we want to get the account detail and
// statuses via the public client, using the id the instance gave us.
// This also makes all profiles shareable.
export const useGetPublicDetail = loader$(async ({ params }) => {
  const c = await createPublicClient(params.instance);

  try {
    const detail = await c.v1.accounts.fetch(params.id);
    const toots = await c.v1.accounts.listStatuses(params.id, {
      excludeReplies: true,
    });

    return { detail, toots };
  } catch (e) {
    console.error(e);

    return { toots: [], detail: null };
  }
});

// When we are authed, we also want the relationship details. To get this, we
// need to go via our own private client, and that will require us to look up
// the user's ID via the username
// TODO: defer this
export const useGetPrivateDetail = loader$(
  async ({ params, cookie, defer }) => {
    if (!cookie.get("token")?.value) {
      return defer(Promise.resolve([]));
    }

    const c = await createClient(cookie, params.instance);

    const detail = await c.v1.accounts.lookup({
      acct: `${params.username}@${params.instance}`,
    });

    return defer(c.v1.accounts.fetchRelationships([detail.id]));
  }
);

export default component$(() => {
  const { detail, toots } = useGetPublicDetail().value;

  return (
    <>
      {detail ? (
        <>
          <div>
            <h2>{detail.displayName}</h2>
            <Follow />
            <div class={meta}>
              <span>{detail.followersCount} followers</span>
              <span>{detail.followingCount} following</span>
              <span>
                {detail.statusesCount} posts since{" "}
                {new Date(detail.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>
          <>{toots ? <Toots toots={toots} /> : <>no more toots</>}</>
        </>
      ) : (
        "oh no"
      )}
    </>
  );
});

export const Follow = component$(() => {
  const loggedIn = useLoggedIn();
  const signal = useGetPrivateDetail();

  return (
    <>
      {loggedIn.value ? (
        <Resource
          value={signal}
          onResolved={(detail) => {
            const following = detail[0].following;

            return (
              <>
                {following ? (
                  <button>unfollow</button>
                ) : (
                  <button>follow</button>
                )}
              </>
            );
          }}
        />
      ) : null}
    </>
  );
});
