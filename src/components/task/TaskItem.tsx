/** @jsxImportSource @emotion/react */
import { CheckableState } from "@/entities/types/dr-nodes";
import { Task } from "@/entities/types/task";
import { useCallback, useMemo } from "react";
import { useDnd } from "../dnd/use-dnd";
import { CheckableDrNode, CheckableNodeDndState } from "../dr-node/CheckableDrNode";
import { DragHandle } from "../dr-node/DragHandle";


type Props = {
  task: Task;
  onStateChange?: (state: CheckableState) => void;
  onContextMenu?: (task: Task) => void;

  /**
   * draggingHandle 앞에 추가될 icon option 컴포넌트들을 정의한다.
   */
  optionIcons?: React.ReactNode[];
}
export const TaskItem = ({
  task,
  onStateChange,
  onContextMenu,
  optionIcons = [],
}: Props) => {
  const {
    isDragging,
    isOver,
    preDragState,
    setPreDragState,
    draggable,
    droppable,
    dndCase
  } = useDnd({
    dndItem: { id: task.name },
    draggable: {
      type: "TASK"
    },
    droppable: {
      accept: ["TASK"],
      rectSplitCount: "two"
    }
  });

  const dndState = useMemo<CheckableNodeDndState>(() => ({
    isDragging,
    isOver,
    preDragState,
    dndCase
  }), [isDragging, isOver, preDragState, dndCase]);

  const handleContextMenu = useCallback(async () => {
    onContextMenu?.(task);
  }, [onContextMenu, task]);

  return (
    <CheckableDrNode
      checkable={task}
      depth={0}
      onStateChange={onStateChange}
      onContextMenu={handleContextMenu}
      // dnd config
      ref={droppable}
      dndState={dndState}
      optionIcons={[
        ...optionIcons,
        <DragHandle
          draggable={draggable}
          preDragState={preDragState}
          setPreDragState={setPreDragState}
        />
      ]}
    />
  )
}