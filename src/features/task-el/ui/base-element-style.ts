import { css } from "@emotion/react";


export const elementHeight = "2.5em";

export const rowRadius = "6px";

export const baseHeaderStyle = css({
  display: "flex",
  position: "relative",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: rowRadius,
  transition: "background-color 120ms ease-out",
  "& *": {
    touchAction: "manipulation",
    userSelect: "none",
  },
  "&::after": {
    content: "''",
  },
  // hover는 터치 기기에서 탭 후 계속 남으므로 hover 가능한 포인터에서만 쓴다.
  "@media (hover: hover)": {
    "&:hover": {
      backgroundColor: "var(--background-modifier-hover)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

// 키보드 포커스 표시: MUI 기본 focus 배경/ripple 대신 accent outline을 쓴다.
export const focusRingStyle = css({
  "&&.Mui-focusVisible": {
    backgroundColor: "transparent",
    outline: "2px solid var(--interactive-accent)",
    outlineOffset: "-2px",
  },
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
    borderRadius: rowRadius,
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
    borderRadius: rowRadius,
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
    borderRadius: rowRadius,
    backgroundColor: "hsla(var(--color-accent-1-hsl), 0.7)",
  }
});
