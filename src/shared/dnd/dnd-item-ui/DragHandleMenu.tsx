/** @jsxImportSource @emotion/react */

import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Touchable } from "@/shared/components/Touchable";
import { forwardRef, useCallback } from "react";
import { DELAY_TOUCH_START } from '../config';
import { DragState } from '../drag-state';



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
        <ObsidianIcon size="20px" color={STYLES.palette.textFaint} icon={"menu"} />
      </Touchable>
    </div>
  )
})