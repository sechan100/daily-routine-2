import { RoutineTask, TaskGroup } from "@entities/note";
import { RoutineRepository } from "@entities/routine";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useRoutineOptionModal } from "./routine-option";

interface RoutineTaskProps {
  task: RoutineTask;
  parent: TaskGroup | null;
}
export const RoutineTaskWidget = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();

  const onOptionClick = useCallback(async () => {
    const routine = await RoutineRepository.load(task.name);
    RoutineOptionModal.open({ routine });
  }, [RoutineOptionModal, task.name])
  
  return (
    <>
      <BaseTaskFeature
        parent={parent}
        className="dr-routine-task"
        task={task}
        onOptionMenu={onOptionClick}
      />
      <RoutineOptionModal />
    </>
  )
});