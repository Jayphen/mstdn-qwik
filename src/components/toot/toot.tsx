import type { mastodon } from "masto";
import { avatarImage, toot } from "./style.css";

export function Toot(props: { toot: mastodon.v1.Status }) {
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
          <div class="meta">
            <span class="name">{props.toot.account.displayName}</span>
            {props.toot.reblog && (
              <>
                retooted
                <span class="name">
                  {props.toot.reblog?.account.displayName}
                </span>
              </>
            )}
            <span class="created">{timeAgo}</span>
          </div>
          {props.toot.reblog ? (
            <>
              <div
                class="content reblog"
                dangerouslySetInnerHTML={props.toot.reblog?.content}
              />
            </>
          ) : (
            <div class="content" dangerouslySetInnerHTML={props.toot.content} />
          )}
          {props.toot.mediaAttachments.length && (
            <div class="attachments">
              {props.toot.mediaAttachments.map((attachment) => (
                <div>
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.description || undefined}
                    height={attachment.meta?.small?.height}
                    width={attachment.meta?.small?.width}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </li>
  );
}
