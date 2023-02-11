import { style } from "@vanilla-extract/css";

export const toot = style({
  display: "grid",
  gridTemplateColumns: "3em 1fr",
  gap: "1em",
  padding: "0.75em",
  background: "white",
});

export const avatarImage = style({
  width: "100%",
});
