import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import {
  attachments,
  attachment as attachmentImage,
  avatarImage,
  content,
  createdAt,
  meta,
  name,
  reblog,
  toot,
  username,
  tootContent,
  tootLink,
} from "./style.css";

export const Toot = component$((props: { toot: mastodon.v1.Status }) => {
  const created = new Date(props.toot.createdAt);
  const loc = useLocation();

  const diff = +created - +new Date();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  const formatter = new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
  });

  const timeAgo =
    hours < -24
      ? created.toLocaleDateString("en-au")
      : formatter.format(
        ...(seconds < -60
          ? minutes < -60
            ? [Math.ceil(hours), "hours"]
            : [Math.ceil(minutes), "minutes"]
          : [Math.ceil(seconds), "seconds"])
      );

  const [accountUsername, accountDomain] = props.toot.account.acct.split("@");

  return (
    <li>
      <article class={toot}>
        <div>
          <img
            class={avatarImage}
            src={props.toot.account.avatarStatic}
            alt=""
          />
        </div>
        <div class={tootContent}>
          <div class={meta}>
            <div>
              <span class={name}>
                {loc.pathname.includes("person") ? (
                  props.toot.account.displayName
                ) : (
                  <a
                    href={`/${loc.params.instance}/person/${props.toot.account.id}/`}
                  >
                    {props.toot.account.displayName}
                  </a>
                )}
              </span>
              <span class={username}>
                {accountUsername}
                {accountDomain && (
                  <>
                    {/* not all domains allow browsing their feed */}
                    {/* would need to look up and cache domains ahead of time */}
                    @<a href={`/${accountDomain}/local`}>{accountDomain}</a>
                  </>
                )}
              </span>
            </div>
            <span class={createdAt}>
              {loc.pathname.includes("post") ? (
                created.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              ) : (
                <a
                  href={`/${loc.params.instance}/public/post/${props.toot.id}/`}
                  class={tootLink}
                >
                  <span>{timeAgo}</span>
                  <span>{props.toot.repliesCount} replies</span>
                </a>
              )}
            </span>
          </div>
          {props.toot.reblog ? (
            <>
              <>
                <span class={name}>
                  retooted{" "}
                  <a
                    href={`/${loc.params.instance}/person/${props.toot.reblog.account.id}/`}
                  >
                    {props.toot.reblog?.account.displayName}
                  </a>
                </span>
              </>
              <div
                class={reblog}
                dangerouslySetInnerHTML={props.toot.reblog?.content}
              />
            </>
          ) : (
            <div class={content} dangerouslySetInnerHTML={props.toot.content} />
          )}
          {props.toot.mediaAttachments.length ? (
            <div class={attachments}>
              {props.toot.mediaAttachments.map((attachment) => (
                <div>
                  <a
                    href={attachment.remoteUrl || attachment.previewUrl}
                    target="_blank"
                  >
                    <img
                      class={attachmentImage}
                      src={attachment.previewUrl}
                      alt={attachment.description || "Image attached toot"}
                      height={attachment.meta?.small?.height}
                      width={attachment.meta?.small?.width}
                      loading="lazy"
                    />
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  );
});
