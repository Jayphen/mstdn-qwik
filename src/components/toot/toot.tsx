import { component$ } from "@builder.io/qwik";
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
} from "./style.css";

export const Toot = component$((props: { toot: mastodon.v1.Status }) => {
  const created = new Date(props.toot.createdAt);

  const diff = created - new Date();
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
        <div class="toot">
          <div class={meta}>
            <div>
              <span class={name}>{props.toot.account.displayName}</span>
              <span class={username}>{props.toot.account.acct}</span>
            </div>
            {props.toot.reblog && (
              <>
                retooted
                <span class={name}>
                  {props.toot.reblog?.account.displayName}
                </span>
              </>
            )}
            <span class={createdAt}>
              <a href={`/post/${props.toot.id}/`}>{timeAgo}</a>
            </span>
          </div>
          {props.toot.reblog ? (
            <>
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
                  <img
                    class={attachmentImage}
                    src={attachment.previewUrl}
                    alt={attachment.description || undefined}
                    height={attachment.meta?.small?.height}
                    width={attachment.meta?.small?.width}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  );
});
