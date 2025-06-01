/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
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
export const TaskComponent = ({
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
      <div
        css={{
          paddingTop: "1em",
          paddingBottom: "1em",
          borderTop: "1px solid var(--color-base-30)",
          borderBottom: "1px solid var(--color-base-30)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {task.name}
        <div
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            cursor: "pointer"
          }}
        >
          <div
            ref={dragHandleRef}
            {...attributes}
            {...listeners}
          >
            핸들
          </div>
        </div>
      </div>
    </BaseDndable>
  )
}