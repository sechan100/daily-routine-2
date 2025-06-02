/** @jsxImportSource @emotion/react */
import { DragEndEvent, DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { css } from "@emotion/react";
import { useCallback, useState } from "react";
import { TEXT_CSS } from "../colors/text-style";
import { desktopModifier, mobileModifier } from "./modifiters";

const textStyle = css([TEXT_CSS.description, {
  color: "var(--color-base-00)",
}])

export const OverlayProvider = () => {
  const [draggingTaskName, setDraggingTaskName] = useState<string | null>(null);

  const onDragMove = useCallback(({ active }: DragEndEvent) => {
    setDraggingTaskName(String(active.id));
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingTaskName(null);
  }, []);

  useDndMonitor({
    onDragMove,
    onDragEnd,
  });

  return (
    <DragOverlay
      zIndex={51}
      modifiers={[desktopModifier, mobileModifier]}
    >
      {draggingTaskName && (
        <div css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          borderRadius: "5px",
          padding: "5px 5px",
          width: "fit-content",
          opacity: 0.8,
          backgroundColor: "var(--color-base-100)",
          boxShadow: "0 0 0.5em 0.5em rgba(0, 0, 0, 0.2)",
          color: "var(--color-base-00)",
        }}>
          <div css={textStyle}>{draggingTaskName}</div>
        </div>
        // <div
        //   css={{
        //     paddingTop: "1em",
        //     paddingBottom: "1em",
        //     border: "1px solid var(--color-base-30)",
        //   }}
        // >
        //   {draggingTaskName}
        // </div>
      )}
    </DragOverlay>
  )
}