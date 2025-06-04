/** @jsxImportSource @emotion/react */

import { STYLES } from "@/shared/colors/palette";
import { Icon } from "@/shared/components/Icon";
import { Touchable } from "@/shared/components/Touchable";
import { DELAY_TOUCH_START } from "@/shared/dnd/dnd-config";
import { DragState } from "@/shared/dnd/drag-state";
import { forwardRef, useCallback } from "react";



type Props = {
  dragState: DragState;
  setDragState: (state: DragState) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
export const DragHandleMenu = forwardRef<HTMLDivElement, Props>(({
  dragState,
  setDragState,
  onClick,
}, ref) => {

  const handlePressChange = useCallback((press: boolean) => {
    if (press) {
      dragState !== "charging" && setDragState("charging");
    } else {
      setDragState("idle");
    }
  }, [dragState, setDragState])

  const handleAfterLongPressDelay = useCallback(() => {
    setDragState("ready");
  }, [setDragState])

  return (
    <div
      ref={ref}
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "end",
        cursor: "grab"
      }}
    >
      <Touchable
        onClick={onClick}
        longPressDelay={DELAY_TOUCH_START}
        onPressChange={handlePressChange}
        onAfterLongPressDelay={handleAfterLongPressDelay}
      >
        <Icon size="20px" color={STYLES.palette.textFaint} icon={"menu"} />
      </Touchable>
    </div>
  )
})