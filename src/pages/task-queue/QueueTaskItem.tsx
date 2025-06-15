/** @jsxImportSource @emotion/react */
import { TaskItem } from "@/components/task/TaskItem";
import { Task } from "@/entities/types/task";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { useCallback } from "react";
import { openQueueTaskControls } from "./QueueTaskControls";
import { openScheduleTaskModal } from "./ScheduleTaskModal";


type Props = {
  task: Task;
}
export const QueueTaskItem = ({
  task,
}: Props) => {

  const handleContext = useCallback(async () => {
    openQueueTaskControls({ task });
  }, [task]);

  const handleCalendarIconClick = useCallback(async () => {
    openScheduleTaskModal({ task });
  }, [task]);

  return (
    <TaskItem
      task={task}
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