/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { TaskItem } from "@/features/task";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { useCallback } from "react";
import { useNoteTasksContext } from "../model/context";
import { useCheckTask } from "../model/use-check-task";
import { openRescheduleTaskModal } from "./RescheduleTaskModal";


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

  const handleCalendarIconClick = useCallback(async () => {
    openRescheduleTaskModal({ task });
  }, [task]);

  return (
    <TaskItem
      task={task}
      onClick={handleClick}
      onContextMenu={handleContext}
      optionIcons={[
        <ObsidianIcon
          icon="calendar"
          onClick={handleCalendarIconClick}
        />
      ]}
    />
  )
}