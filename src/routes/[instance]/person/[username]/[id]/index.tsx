/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import { Toots } from "~/components/toots/toots";
import { createClient } from "~/lib/mastodon";
import { meta } from "./index.css";

// let's just fetch using the authed client.
// If the posts aren't included for some reason, too bad I guess.
//
//

export const useGetPerson = loader$(async function useGetPerson(ev) {
  try {
    const client = await createClient(ev);

    const detail = await client.v1.accounts.fetch(ev.params.id);
    const toots = await client.v1.accounts.listStatuses(ev.params.id, {
      excludeReplies: true,
    });

    return { detail, toots };
  } catch (_e) {
    throw ev.html(500, `oh no oh boy`);
  }
});

// todo todo:
// If we always fetch toots using the public client, when you try to reply with your
// logged-in client, it will not be able to find the id. oh dear.

// When browsing an alien instance, we want to get the account detail and
// statuses via the public client, using the id the instance gave us.
// This also makes all profiles shareable.
// export const useGetPublicDetail = loader$(async ({ params }) => {
//   const c = await createPublicClient(params.instance);
//
//   try {
//     const detail = await c.v1.accounts.fetch(params.id);
//     const toots = await c.v1.accounts.listStatuses(params.id, {
//       excludeReplies: true,
//     });
//
//     return { detail, toots };
//   } catch (e) {
//     console.error(e);
//
//     return { toots: [], detail: null };
//   }
// });

// When we are authed, we also want the relationship details. To get this, we
// need to go via our own private client, and that will require us to look up
// the user's ID via the username
// TODO: defer this
// export const useGetPrivateDetail = loader$(
//   async ({ params, cookie, defer }) => {
//     if (!cookie.get("token")?.value) {
//       return defer(Promise.resolve({ detail: [], toots: [] }));
//     }
//
//     const c = await createClient(cookie, params.instance);
//
//     const detail = await c.v1.accounts.lookup({
//       acct: `${params.username}@${params.instance}`,
//     });
//
//     return defer(
//       c.v1.accounts
//         .fetchRelationships([detail.id])
//         .then((res) => ({ detail: res }))
//     );
//   }
// );
//
// export const useGetAuthedToots = loader$(async ({ params, cookie }) => {
//   if (!cookie.get("token")?.value) {
//     return [];
//   }
//   const c = await createClient(cookie, params.instance);
//
//   const detail = await c.v1.accounts.lookup({
//     acct: `${params.username}@${params.instance}`,
//   });
//
//   const toots = await c.v1.accounts.listStatuses(detail.id, {
//     excludeReplies: true,
//   });
//
//   return toots;
// });

export default component$(() => {
  const { detail, toots } = useGetPerson().value;

  return (
    <>
      {detail ? (
        <>
          <div>
            <h2>{detail.displayName}</h2>
            {/* <Follow /> */}
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
          <Toots toots={toots} />
        </>
      ) : (
        "oh no"
      )}
    </>
  );
});

// export const Follow = component$(() => {
//   const loggedIn = useLoggedIn();
//   const signal = useGetPrivateDetail();
//
//   return (
//     <>
//       {loggedIn.value ? (
//         <Resource
//           value={signal}
//           onResolved={({ detail }) => {
//             const following = detail[0].following;
//
//             return (
//               <>
//                 {following ? (
//                   <button>unfollow</button>
//                 ) : (
//                   <button>follow</button>
//                 )}
//               </>
//             );
//           }}
//         />
//       ) : null}
//     </>
//   );
// });
