/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { TaskItem } from "@/features/task";
import { useCallback } from "react";
import { openQueueTaskControls } from "./QueueTaskControls";


type Props = {
  task: Task;
}
export const QueueTaskItem = ({
  task,
}: Props) => {

  const handleClick = useCallback(async () => {
  }, []);

  const handleContext = useCallback(async () => {
    openQueueTaskControls({ task });
  }, [task]);

  // DEV: 즉시 task controls를 열도록 함.
  // const isMounted = useRef(false);
  // useEffect(() => {
  //   if (isMounted.current) {
  //     return;
  //   }
  //   isMounted.current = true;
  //   if (task.name === "립밤사기") {
  //     handleContext();
  //   }
  // }, [handleContext, task]);
  // ]]

  return (
    <TaskItem
      task={task}
      onClick={handleClick}
      onContextMenu={handleContext}
    />
  )
}