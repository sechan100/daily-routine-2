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