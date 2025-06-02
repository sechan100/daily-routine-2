/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/features/checkable";
import { BaseDndable } from "@/shared/dnd/Dndable";
import { DndData } from "@/shared/dnd/drag-data";
import { useDnd } from "@/shared/dnd/use-dnd";
import { useIndicator } from "../model/indicator-store";



const dndData: DndData = {
  isFolder: false,
  isOpen: false,
}

type Props = {
  task: Task;
}
export const TaskItem = ({
  task,
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
    id: task.name,
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
      <CheckableRippleBase>
        <CheckableFlexContainer>
          <CheckableArea checkable={task} />
          <DragHandleMenu
            dragHandleRef={dragHandleRef}
            attributes={attributes}
            listeners={listeners}
          />
        </CheckableFlexContainer>
      </CheckableRippleBase>
    </BaseDndable >
  )
}