import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { mastodon } from "masto";
import {
  attachments,
  attachment as attachmentImage,
  avatarImage,
  content,
  createdAt,
  name,
  reblog,
  toot,
  username,
  tootContent,
  tootLink,
  tootbar,
  tootwrapper,
  displayName,
} from "./style.css";

export const Toot = component$((props: { toot: mastodon.v1.Status }) => {
  const created = new Date(props.toot.createdAt);
  const loc = useLocation();

  const diff = +created - +new Date();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
    style: "narrow",
  });

  const timeAgo = (() => {
    switch (true) {
      case hours < -24:
        return created.toLocaleDateString();
      case minutes < -60:
        return formatter.format(Math.ceil(hours), "hours");
      case minutes < -1:
        return formatter.format(Math.ceil(minutes), "minutes");
      default:
        return formatter.format(Math.ceil(seconds), "seconds");
    }
  })();

  const [accountUsername, accountDomain] = props.toot.account.acct.split("@");

  return (
    <li class={tootwrapper}>
      <article class={toot}>
        <img class={avatarImage} src={props.toot.account.avatarStatic} alt="" />
        <div class={displayName}>
          <span class={name}>
            {loc.pathname.includes("person") ? (
              props.toot.account.displayName
            ) : (
              <a
                href={`/${loc.params.instance}/person/${accountUsername}/${props.toot.account.id}/`}
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
                {/* would need to look up and cache domains ahead of time */}@
                <a href={`/${accountDomain}/local`}>{accountDomain}</a>
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
            </a>
          )}
        </span>
        <div class={tootContent}>
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
      <div class={tootbar}>
        <span>
          <a href={`/${loc.params.instance}/public/post/${props.toot.id}/`}>
            💬 {props.toot.repliesCount}
          </a>
        </span>
        <span>🔄 {props.toot.reblogsCount}</span>
        <span>⭐ {props.toot.favouritesCount}</span>
      </div>
    </li>
  );
});
