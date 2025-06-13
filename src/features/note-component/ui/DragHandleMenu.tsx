/** @jsxImportSource @emotion/react */

import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Touchable } from "@/shared/components/Touchable";
import { DELAY_TOUCH_START } from "@/shared/dnd/config";
import { DragState } from "@/shared/dnd/drag-state";
import { forwardRef, useCallback } from "react";
import { checkableStyle } from "./checkable-style";


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

  const handleContextMenu = useCallback(() => {
    setDragState("ready");
  }, [setDragState])

  return (
    <Touchable
      ref={ref}
      onClick={onClick}
      longPressDelay={DELAY_TOUCH_START}
      onPressChange={handlePressChange}
      onContextMenu={handleContextMenu}
      sx={{
        // border: `1px solid blue`,
        display: "flex",
        alignItems: "center",
        justifyContent: "end",
        cursor: "grab",
        paddingRight: checkableStyle.paddingRight,
      }}
    >
      <ObsidianIcon color={STYLES.palette.textFaint} icon={"menu"} />
    </Touchable>
  )
})