import { globalStyle, style } from "@vanilla-extract/css";

export const tootwrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5em",
});

export const toot = style({
  display: "grid",
  gridTemplateAreas: `
    "avatar name    time"
    ".      content content"
  `,
  gridTemplateColumns: "3em 1fr 1fr",
  gap: "1em",
  padding: "0.75em",
  background: "white",
  borderRadius: "8px",

  "@media": {
    "(max-width: 550px)": {
      gridTemplateAreas: `
        "avatar time time"
        "name name name"
        "content content content"
      `,
      gridTemplateColumns: "1fr 1fr",
      gap: "0.5em",
    },
  },
});

export const avatarImage = style({
  gridArea: "avatar",
  width: "100%",
  borderRadius: "100%",

  "@media": {
    "(max-width: 550px)": {
      width: "3em",
    },
  },
});

export const displayName = style({
  gridArea: "name",
});

export const tootContent = style({
  display: "grid",
  gap: "0.5em",
  gridArea: "content",
});

export const content = style({
  display: "grid",
  gap: "1em",
  wordBreak: "break-word",
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
  gridArea: "time",

  "@media": {
    "(max-width: 550px)": {
      alignSelf: "center",
    },
  },
});

export const tootLink = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
});

export const attachments = style({
  width: "100%",
});

export const attachment = style({
  objectFit: "fill",
  maxWidth: "100%",
  height: "auto",
});

export const tootbar = style({
  background: "white",
  borderRadius: "8px",
  display: "flex",
  padding: "0.5em",
  opacity: 0.5,
  position: "relative",
  gap: "1em",
  justifyContent: "space-between",
  transition: "opacity 0.3s ease",

  selectors: {
    [`${tootwrapper}:hover &`]: {
      opacity: 1,
    },
  },
});

globalStyle(`${tootbar} a`, {
  color: "inherit",
  textDecoration: "none",
});
