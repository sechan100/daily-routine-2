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
        height: "100%",
        cursor: "grab",
        paddingRight: "16px",
      }}
    >
      <ObsidianIcon color={STYLES.palette.textFaint} icon={"menu"} />
    </Touchable>
  )
})