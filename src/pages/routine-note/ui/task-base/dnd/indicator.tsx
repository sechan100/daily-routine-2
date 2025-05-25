/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React from "react";


export type IndicatorMode = "top" | "bottom" | "in";

const lineStyle = (direction: "top" | "bottom") => css({
  width: "100%",
  height: "2px",
  backgroundColor: "hsla(var(--color-accent-1-hsl), 1)",
  top: direction === "top" ? "0" : "calc(100%)",
  zIndex: 10,

  // dot
  "&::before": {
    content: "''",
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "100%",
    backgroundColor: "hsla(var(--color-accent-1-hsl), 1)",
    top: "-4px",
    left: "0",
    transform: "translateX(-50%)",
    zIndex: 10,
  }
})

const inActiveStyle = css({
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  borderRadius: "5px",
  backgroundColor: "hsla(var(--color-accent-1-hsl), 0.5)",
})

export const DndIndicator = React.memo(({ mode }: { mode: IndicatorMode }) => {
  return (
    <div css={[
      {
        position: "absolute",
      }, 
      mode === "in" ? inActiveStyle : lineStyle(mode)
    ]}/>
  )
})