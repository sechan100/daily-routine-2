/** @jsxImportSource @emotion/react */
// eslint-disable-next-line fsd-import/layer-imports
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
      // top-left를 0으로 해서, dnd-kit이 인식하는 top, left가 어디인지를 확인할 수 있고 이를 기반으로 platform별 위치 재조정이 가능하다.
      style={{
        // left: "0",
        // top: "0",
      }}
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
        // <ButtonBase
        //   LinkComponent={"div"}
        //   href='#'
        //   color='primary'
        //   css={{
        //     ".MuiTouchRipple-child": {
        //       backgroundColor: "var(--color-accent-1) !important",
        //     },
        //     width: "100%",
        //     border: "1px solid var(--color-base-100)",
        //     backgroundColor: "var(--color-base-30)",
        //     padding: "0",
        //     margin: "0",
        //     cursor: "pointer",
        //     lineHeight: 1,
        //   }}
        // >
        //   <CheckableFlexContainer>
        //     <CheckableArea checkable={{
        //       name: draggingTaskName,
        //       state: "un-checked",
        //     }} />
        //     <div
        //       css={{
        //         display: "flex",
        //         alignItems: "center",
        //         justifyContent: "end",
        //         cursor: "grab"
        //       }}
        //     >
        //       <Icon size="20px" color={STYLES.palette.textFaint} icon={"menu"} />
        //     </div>
        //   </CheckableFlexContainer>
        // </ButtonBase>
      )}
    </DragOverlay>
  )
}