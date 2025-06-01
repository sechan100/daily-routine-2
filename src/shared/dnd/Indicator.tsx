/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { memo, useMemo } from "react";
import { DndCase } from "./resolve-dnd-case";


const getLineStyle = (direction: "top" | "bottom", overDepth: number) => css({
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

const boxStyle = css({
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  borderRadius: "5px",
  backgroundColor: "hsla(var(--color-accent-1-hsl), 0.5)",
})

type IndicatorProps = {
  dndCase: DndCase;
  depth: number;
}
export const Indicator = memo(({ dndCase, depth }: IndicatorProps) => {
  const dndCaseStyle = useMemo(() => {
    switch (dndCase) {
      case "insert-before":
        return getLineStyle("top", depth);
      case "insert-after":
        return getLineStyle("bottom", depth);
      case "insert-into-first":
        return getLineStyle("top", depth + 1);
      case "insert-into-last":
        return boxStyle;
      default:
        return css({});
    }
  }, [dndCase, depth]);

  return (
    <div css={[
      { position: "absolute", },
      dndCaseStyle
    ]} />
  )
})