/** @jsxImportSource @emotion/react */
import { NoteRoutine } from "@/entities/note";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/features/checkable";
import { BaseDndable } from "@/shared/dnd/Dndable";
import { DndData } from "@/shared/dnd/drag-data";
import { useDnd } from "@/shared/dnd/use-dnd";
import { css } from "@emotion/react";
import { useIndicator } from "../model/indicator-store";


const indentStyle = css({
  borderLeft: "1px solid var(--color-base-30)",
  margin: "0 0 0 20px",
})

const dndData: DndData = {
  isFolder: false,
  isOpen: false,
}

type Props = {
  routine: NoteRoutine;
  depth: number;
}
export const RoutineItem = ({
  routine,
  depth,
}: Props) => {

  const {
    dndRef,
    dragHandleRef,
    attributes,
    listeners,
    isDragging,
    isOver,
    dndCase
  } = useDnd({
    id: routine.name,
    dndData,
    useIndicator: useIndicator,
    useDragHandle: true,
  });

  return (
    <BaseDndable
      dndRef={dndRef}
      dndCase={dndCase}
      isDragging={isDragging}
      isOver={isOver}
      depth={0}
    >
      <div css={depth !== 0 && indentStyle}>
        <CheckableRippleBase>
          <CheckableFlexContainer>
            <CheckableArea checkable={routine} />
            <DragHandleMenu
              dragHandleRef={dragHandleRef}
              attributes={attributes}
              listeners={listeners}
            />
          </CheckableFlexContainer>
        </CheckableRippleBase>
      </div>
    </BaseDndable >
  )
}