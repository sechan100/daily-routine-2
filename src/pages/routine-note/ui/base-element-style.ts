import { css } from "@emotion/react";


export const elementHeight = "2.5em";

export const baseHeaderStyle = css({
  display: "flex",
  position: "relative",
  alignItems: "center",
  justifyContent: "space-between",
  "& *": {
    touchAction: "manipulation",
    userSelect: "none",
  },
  "&::after": {
    content: "''",
  }
});

export const pressedStyle = css({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    borderRadius: "5px",
    backgroundColor: "var(--color-base-40)",
    transition: "ease-in 0.25s",
    opacity: 0.5,
  }
});

export const dragReadyStyle = css({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    borderRadius: "5px",
    backgroundColor: "hsla(var(--color-accent-1-hsl), 0.7)",
  }
});

export const draggingStyle = css({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    borderRadius: "5px",
    backgroundColor: "hsla(var(--color-accent-1-hsl), 0.7)",
  }
});
