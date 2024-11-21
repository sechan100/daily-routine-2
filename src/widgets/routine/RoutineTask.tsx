import { RoutineTask as RoutineTaskEntity, Task } from "@entities/note";
import { routineService } from "@entities/routine";
import { useRoutineOptionModal } from "./routine-option";
import { AbstractTask } from "@features/task";
import React, { useCallback } from "react";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";


interface RoutineTaskProps {
  task: RoutineTaskEntity;
}
export const RoutineTask = React.memo(({ task }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();

  const onOptionClick = useCallback(async () => {
    const routine = await routineService.get(task.name);
    RoutineOptionModal.open({ routine });
  }, [RoutineOptionModal, task.name])

  
  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    await routineService.reorder(tasks.filter(t => t.type === "routine").map(r => r.name))
    executeRoutineNotesSynchronize();
  }, [])

  
  return (
    <>
      <AbstractTask
        onTaskReorder={onTaskReorder}
        className="dr-routine-task"
        task={task}
        onOptionMenu={onOptionClick}
      />
      <RoutineOptionModal />
    </>
  )
});