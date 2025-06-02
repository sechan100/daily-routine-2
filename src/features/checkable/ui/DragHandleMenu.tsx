/** @jsxImportSource @emotion/react */

import { STYLES } from "@/shared/colors/palette";
import { Icon } from "@/shared/components/Icon";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";



type Props = {
  dragHandleRef: (ref: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
export const DragHandleMenu = ({
  dragHandleRef,
  attributes,
  listeners,
  onClick,
}: Props) => {

  return (
    <>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          cursor: "grab"
        }}
        onClick={onClick}
        ref={dragHandleRef}
        {...attributes}
        {...listeners}
      >
        <Icon size="20px" color={STYLES.palette.textFaint} icon={"menu"} />
      </div>
    </>
  )
}