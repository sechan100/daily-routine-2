/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { CheckableArea, CheckableFlexContainer, CheckableRippleBase, DragHandleMenu } from "@/features/checkable";
import { STYLES } from "@/shared/colors/styles";
import { DragState } from "@/shared/dnd/drag-state";
import { Indicator } from "@/shared/dnd/Indicator";
import { useDnd } from "@/shared/dnd/use-dnd";
import { Platform } from "obsidian";
import { useCallback, useRef, useState } from "react";


type Props = {
  task: Task;
}
export const TaskItem = ({
  task,
}: Props) => {
  const [dragState, setDragState] = useState<DragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    dndCase
  } = useDnd({
    dndItem: {
      id: task.name,
    },
    draggable: {
      type: "TASK",
      canDrag: Platform.isMobile ? dragState === "ready" : true,
      ref: draggableRef
    },
    droppable: {
      accept: ["TASK"],
      ref: droppableRef,
      rectSplitCount: "two"
    }
  });

  const handleClick = useCallback(() => {
  }, []);

  const handleContext = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div
      ref={droppableRef}
      onClick={handleClick}
      onContextMenu={handleContext}
      css={{
        position: "relative",
        touchAction: "none",
        backgroundColor: isDragging || dragState === "ready" ? STYLES.palette.accent : undefined,
      }}
    >
      <CheckableRippleBase>
        <CheckableFlexContainer>
          <CheckableArea checkable={task} />
          <DragHandleMenu
            ref={draggableRef}
            dragState={dragState}
            setDragState={setDragState}
          />
        </CheckableFlexContainer>
      </CheckableRippleBase>
      <Indicator dndCase={dndCase} depth={0} />
    </div>
  )
}