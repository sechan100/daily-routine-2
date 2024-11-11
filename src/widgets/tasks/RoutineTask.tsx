import { RoutineTask as RoutineTaskEntity, Task, useRoutineNote } from "entities/note";
import { routineManager } from "entities/routine";
import { useRoutineOptionModal } from "features/routine";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback, useEffect } from "react"
import { registerRoutineNotesSynchronize } from "entities/note-synchronize";


interface RoutineTaskProps {
  task: RoutineTaskEntity;
}
export const RoutineTask = React.memo(({ task }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();

  const onOptionClick = useCallback(async () => {
    const routine = await routineManager.get(task.name);
    RoutineOptionModal.open({ routine });
  }, [RoutineOptionModal, task.name])
  
  // DEV: 바로 루틴 옵션 열어주기
  useEffect(() => {
    if(task.name === "💪 틈틈이 어깨펴고 목 펴기"){
      onOptionClick();
    }
  }, [onOptionClick, task.name])


  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    await routineManager.reorder(tasks.filter(t => t.type === "routine").map(r => r.name))
    registerRoutineNotesSynchronize();
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