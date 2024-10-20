import { routineNoteService, RoutineTask as RoutineTaskEntity, Task as TaskEntity } from "entities/routine-note";
import { routineNoteArchiver } from "entities/archive";
import { routineManager } from "entities/routine";
import { openRoutineOptionModal } from "features/routine";
import { useRoutineNoteState } from "features/task";
import { Task } from "features/task";
////////////////////////////
import React, { useCallback } from "react"
import { drEvent } from "shared/event";


interface RoutineTaskProps {
  routineTask: RoutineTaskEntity;
  onTaskClick?: (task: RoutineTaskEntity) => void;
}
export const RoutineTask = React.memo(({ routineTask, onTaskClick }: RoutineTaskProps) => {

  const [ routineNote, ] = useRoutineNoteState();

  // 루틴 클릭시
  const onClick = useCallback((task: RoutineTaskEntity) => {

    // 루틴노트 업데이트
    routineNoteService.checkTask(routineNote, routineTask.name, task.checked);
    routineNoteArchiver.save(routineNote);

    if(onTaskClick) onTaskClick(task);
  }, [routineTask.name, routineNote, onTaskClick])

  // option 클릭시
  const onOptionClick = useCallback(async () => {
    const routine = await routineManager.get(routineTask.name);
    openRoutineOptionModal({routine});
  }, [routineTask])

  const onTaskReorder = useCallback(async (tasks: TaskEntity[]) => {
    await routineManager.reorder(tasks.filter(t => t.type === "routine").map(r => r.name))
    drEvent.emit("reorderRoutine", { tasks });
  }, [])

  return (
    <Task
      onTaskReorder={onTaskReorder}
      className="dr-routine-task"
      task={routineTask}
      onOptionClick={onOptionClick}
      onTaskClick={onClick}
    />
  )
});