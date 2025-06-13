/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { TaskItem } from "@/features/task";
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

  const handleClick = useCallback(async () => {
  }, []);

  const handleContext = useCallback(async () => {
    openQueueTaskControls({ task });
  }, [task]);

  const handleCalendarIconClick = useCallback(async () => {
    openScheduleTaskModal({ task });
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