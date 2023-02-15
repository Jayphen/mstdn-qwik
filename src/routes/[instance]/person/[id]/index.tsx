import { component$ } from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";
import { login } from "masto";
import { Toots } from "~/components/toots/toots";
import { meta } from "./index.css";

export const getPersonDetail = loader$(async ({ params }) => {
  const client = await login({ url: `https://${params.instance}` });

  const toots = await client.v1.accounts.listStatuses(params.id, {
    excludeReplies: true,
  });

  const detail = await client.v1.accounts.fetch(params.id);

  return { toots, detail };
});

export default component$(() => {
  const signal = getPersonDetail.use();

  return (
    <>
      <div>
        <h2>{signal.value.detail.displayName}</h2>
        <div class={meta}>
          <span>{signal.value.detail.followersCount} followers</span>
          <span>{signal.value.detail.followingCount} following</span>
          <span>
            {signal.value.detail.statusesCount} posts since{" "}
            {new Date(signal.value.detail.createdAt).toLocaleDateString(
              undefined,
              { dateStyle: "medium" }
            )}
          </span>
        </div>
      </div>
      <Toots toots={signal.value.toots} />
    </>
  );
});
