/** @jsxImportSource @emotion/react */
import { CheckableState, Task } from "@/entities/note";
// eslint-disable-next-line fsd-import/layer-imports
import { CheckableItem } from "@/features/note-component";
import { useCallback } from "react";


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

  const handleContextMenu = useCallback(async () => {
    onContextMenu?.(task);
  }, [onContextMenu, task]);

  return (
    <CheckableItem
      checkable={task}
      depth={0}
      draggableType="TASK"
      droppableAccept={["TASK"]}
      dndItem={{ id: task.name }}
      onStateChange={onStateChange}
      onContextMenu={handleContextMenu}
      optionIcons={optionIcons}
    />
  )
}