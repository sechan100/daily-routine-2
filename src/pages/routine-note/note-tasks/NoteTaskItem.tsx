/** @jsxImportSource @emotion/react */
import { TaskItem } from "@/components/task/TaskItem";
import { Task } from "@/entities/types/task";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { useCallback } from "react";
import { useNoteTasksContext } from "./context";
import { openRescheduleTaskModal } from "./RescheduleTaskModal";
import { useCheckTask } from "./use-check-task";


type Props = {
  task: Task;
}
export const NoteTaskItem = ({
  task,
}: Props) => {
  const { changeTaskState } = useCheckTask(task);
  const { openTaskControls } = useNoteTasksContext();

  const handleContext = useCallback(async () => {
    openTaskControls(task);
  }, [openTaskControls, task]);

  const handleCalendarIconClick = useCallback(async () => {
    openRescheduleTaskModal({ task });
  }, [task]);

  return (
    <TaskItem
      task={task}
      onStateChange={changeTaskState}
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