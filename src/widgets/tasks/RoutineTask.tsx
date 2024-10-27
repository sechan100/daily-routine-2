import { RoutineTask as RoutineTaskEntity, Task } from "entities/note";
import { routineManager } from "entities/routine";
import { openRoutineOptionModal } from "features/routine";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback } from "react"
import { drEvent } from "shared/event";


interface RoutineTaskProps {
  task: RoutineTaskEntity;
}
export const RoutineTask = React.memo(({ task }: RoutineTaskProps) => {

  const onClick = useCallback((task: RoutineTaskEntity) => {
    // 필요시..ss
  }, [])

  const onOptionClick = useCallback(async () => {
    const routine = await routineManager.get(task.name);
    openRoutineOptionModal({routine});
  }, [task])

  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    await routineManager.reorder(tasks.filter(t => t.type === "routine").map(r => r.name))
    drEvent.emit("reorderRoutine", { tasks });
  }, [])

  return (
    <AbstractTask
      onTaskReorder={onTaskReorder}
      className="dr-routine-task"
      task={task}
      onOptionMenu={onOptionClick}
      onTaskClick={onClick}
    />
  )
});