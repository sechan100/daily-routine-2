/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { TaskItem } from "@/features/task";
import { useCallback } from "react";
import { useNoteTasksContext } from "../model/context";
import { useCheckTask } from "../model/use-check-routine";


type Props = {
  task: Task;
}
export const NoteTaskItem = ({
  task,
}: Props) => {
  const { handleTaskCheck } = useCheckTask(task);
  const { openTaskControls } = useNoteTasksContext();

  const handleClick = useCallback(async () => {
    await handleTaskCheck();
  }, [handleTaskCheck]);

  const handleContext = useCallback(async () => {
    openTaskControls(task);
  }, [openTaskControls, task]);

  return (
    <TaskItem
      task={task}
      onClick={handleClick}
      onContextMenu={handleContext}
    />
  )
}