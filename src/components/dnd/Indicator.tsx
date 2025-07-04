/** @jsxImportSource @emotion/react */
import { getAccent } from "@/shared/styles/obsidian-accent-color";
import { css } from "@emotion/react";
import { memo, useMemo } from "react";
import { DndCase } from "./dnd-case";

const INDICATOR_Z_INDEX = 990;

export const DRAG_ITEM_INDENT = 25;

const getLineStyle = (direction: "top" | "bottom", depth: number) => css({
  width: "100%",
  height: "2px",
  backgroundColor: "hsla(var(--color-accent-1-hsl), 1)",
  top: direction === "top" ? "0" : "calc(100%)",
  zIndex: INDICATOR_Z_INDEX,
  marginLeft: `${depth * DRAG_ITEM_INDENT}px`,

  // dot
  "&::before": {
    content: "''",
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "100%",
    backgroundColor: "hsla(var(--color-accent-1-hsl), 1)",
    top: "-4px",
    left: "5px",
    transform: "translateX(-50%)",
    zIndex: INDICATOR_Z_INDEX,
  }
})

const boxStyle = css({
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  borderRadius: "5px",
  backgroundColor: getAccent({ a: 0.5 }),
})

type IndicatorProps = {
  dndCase: DndCase | null;
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
        return getLineStyle("bottom", depth + 1);
      case "insert-into-last":
        return boxStyle;
      default:
        return css({});
    }
  }, [dndCase, depth]);

  if (dndCase === null) {
    return <></>
  }

  return (
    <div css={[
      { position: "absolute", },
      dndCaseStyle
    ]} />
  )
})