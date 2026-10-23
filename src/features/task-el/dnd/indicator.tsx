/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import React from "react";


export type IndicatorMode = "top" | "bottom" | "in";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const baseStyle = css({
  position: "absolute",
  pointerEvents: "none",
  zIndex: 10,
  animation: `${fadeIn} 100ms ease-out`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

// 행 안쪽 가장자리에 그린다. 바깥에 그리면 스크롤 영역의 맨 위·아래 행에서 잘린다.
const lineStyle = (mode: "top" | "bottom") => css({
  left: 0,
  right: 0,
  [mode]: 0,
  height: "2px",
  borderRadius: "1px",
  backgroundColor: "var(--interactive-accent)",

  // 시작점의 점
  "&::before": {
    content: "''",
    position: "absolute",
    insetInlineStart: "-3px",
    top: "50%",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "var(--interactive-accent)",
  },
});

const inStyle = css({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: "var(--radius-s)",
  backgroundColor: "hsla(var(--color-accent-hsl), 0.12)",
  boxShadow: "inset 0 0 0 1.5px var(--interactive-accent)",
});

export const DndIndicator = React.memo(({ mode }: { mode: IndicatorMode }) => {
  return (
    <div
      aria-hidden
      css={[baseStyle, mode === "in" ? inStyle : lineStyle(mode)]}
    />
  )
})
