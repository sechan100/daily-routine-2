import { RoutineTask, Task } from "@entities/note";
import { Routine, RoutineRepository } from "@entities/routine";
import { useRoutineOptionModal } from "./routine-option";
import { AbstractTask } from "@features/task";
import React, { useCallback } from "react";
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { reorderRoutines } from "./model/reorder-routines";


// tasks에서 routineTask들을 추출하여, 이들 사이의 순서가 반영된 Routine[]을 반환한다.
const resolveRoutinesFromTasks = async (tasks: Task[]): Promise<Routine[]> => {
  const routineTasks: RoutineTask[] = tasks.filter(t => t.type === "routine") as RoutineTask[];
  const routines = await RoutineRepository.loadAll();
  const routineMap = new Map<string, Routine>(routines.map(r => [r.name, r]));

  return routineTasks.map(rt => {
    const routine = routineMap.get(rt.name);
    if(!routine) throw new Error(`Routine '${rt.name}' not found. but it is in the Task[] as a RoutineTask.`);
    return routine;
  });
}


interface RoutineTaskProps {
  task: RoutineTask;
}
export const RoutineTaskWidget = React.memo(({ task }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();

  const onOptionClick = useCallback(async () => {
    const routine = await RoutineRepository.load(task.name);
    RoutineOptionModal.open({ routine });
  }, [RoutineOptionModal, task.name])

  
  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    const { routines, requireUpdateMap } = await reorderRoutines(await resolveRoutinesFromTasks(tasks));
    for(const routine of routines) {
      if(!requireUpdateMap.get(routine.name)) continue;
      await RoutineRepository.update(routine.name, routine);
    }
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