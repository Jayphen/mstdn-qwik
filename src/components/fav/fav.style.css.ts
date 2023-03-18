import { style } from "@vanilla-extract/css";

export const favButton = style({
  fontSize: "inherit",
  border: 0,
  background: "transparent",
  cursor: "pointer",
});

export const faved = style([
  favButton,
  {
    fontWeight: "bold",
    color: "green",
  },
]);
