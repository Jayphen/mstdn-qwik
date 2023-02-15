import { globalStyle, style } from "@vanilla-extract/css";

export const toot = style({
  display: "grid",
  gridTemplateColumns: "3em 1fr",
  gap: "1em",
  padding: "0.75em",
  background: "white",

  "@media": {
    "(max-width: 550px)": {
      gridTemplateColumns: "1fr",
      gap: "0.25em",
    },
  },
});

export const tootContent = style({
  display: "grid",
  gap: "0.5em",
});

export const content = style({
  display: "grid",
  gap: "1em",
});

export const reblog = style([
  content,
  {
    fontSize: "0.85em",
    padding: "0.5em",
    border: "1px solid #eaeaea",
  },
]);

globalStyle(`${content} span.invisible`, {
  position: "absolute",
  width: 0,
  height: 0,
  display: "inline-block",
  fontSize: 0,
});

globalStyle(`${content} span.ellipsis:after`, {
  content: "…",
});

globalStyle(`${content} .hashtag`, {
  fontSize: "0.75em",
  textDecoration: "none",
});

globalStyle(`${content} p`, {
  margin: 0,
});

export const meta = style({
  display: "flex",
  gap: "0.5em",
  alignItems: "center",
});

export const name = style({
  fontWeight: 700,
});

export const username = style({
  fontWeight: 500,
  display: "block",
  fontSize: "0.875em",
});

export const createdAt = style({
  marginLeft: "auto",
  fontSize: "0.75em",
});

export const tootLink = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
});

export const avatarImage = style({
  width: "100%",
  borderRadius: "100%",

  "@media": {
    "(max-width: 550px)": {
      width: "3em",
    },
  },
});

export const attachments = style({
  width: "100%",
});

export const attachment = style({
  objectFit: "fill",
  maxWidth: "100%",
  height: "auto",
});
