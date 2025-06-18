/** @jsxImportSource @emotion/react */
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { Touchable } from "@/shared/components/Touchable";
import { STYLES } from "@/shared/styles/styles";
import { RefObject, useCallback } from "react";
import { DELAY_TOUCH_START } from "../dnd/config";
import { PreDragState } from "../dnd/pre-drag-state";


type Props = {
  draggable: RefObject<HTMLDivElement>;
  preDragState: PreDragState;
  setPreDragState: (state: PreDragState) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
export const DragHandle = ({
  draggable,
  preDragState,
  setPreDragState,
  onClick,
}: Props) => {

  const handlePressChange = useCallback((press: boolean) => {
    if (press) {
      preDragState !== "charging" && setPreDragState("charging");
    }
    else {
      setPreDragState("idle");
    }
  }, [preDragState, setPreDragState])

  const handleContextMenu = useCallback(() => {
    setPreDragState("ready");
  }, [setPreDragState]);

  return (
    <Touchable
      ref={draggable}
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
      }}
    >
      <ObsidianIcon color={STYLES.palette.textFaint} icon={"menu"} />
    </Touchable>
  )
}