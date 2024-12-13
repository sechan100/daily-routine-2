import { RoutineTaskDto, TaskDto, TaskGroupDto } from "@entities/note";
import { RoutineDto, RoutineRepository } from "@entities/routine";
import { useRoutineOptionModal } from "./routine-option";
import { AbstractTaskWidget } from "@features/task-el";
import React, { useCallback } from "react";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";

interface RoutineTaskProps {
  task: RoutineTaskDto;
  parent: TaskGroupDto | null;
}
export const RoutineTaskWidget = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();

  const onOptionClick = useCallback(async () => {
    const routine = await RoutineRepository.load(task.name);
    RoutineOptionModal.open({ routine: routine.toJSON() });
  }, [RoutineOptionModal, task.name])

  
  const onTaskReorder = useCallback(async (tasks: TaskDto[]) => {
    // const { routines, requireUpdateMap } = await reorderRoutines(await resolveRoutinesFromTasks(tasks));
    // for(const routine of routines) {
    //   if(!requireUpdateMap.get(routine.name)) continue;
    //   await RoutineRepository.updateRoutine(routine.name, routine);
    // }
    // executeRoutineNotesSynchronize();
  }, [])

  
  return (
    <>
      <AbstractTaskWidget
        parent={parent}
        // onTaskReorder={onTaskReorder}
        className="dr-routine-task"
        task={task}
        onOptionMenu={onOptionClick}
      />
      <RoutineOptionModal />
    </>
  )
});