import { routineNoteService, RoutineTask as RoutineTaskEntity } from "entities/routine-note";
import { routineNoteArchiver } from "entities/archive";
import { routineManager } from "entities/routine";
import { openRoutineOptionModal } from "features/routine/routine-option";
import { useRoutineNoteState } from "features/task/task-context";
import { Task } from "features/task/Task";
////////////////////////////
import React, { useCallback } from "react"


interface RoutineTaskProps {
  routineTask: RoutineTaskEntity;
  onTaskClick?: (task: RoutineTaskEntity) => void;
}
export const RoutineTask = React.memo(({ routineTask, onTaskClick }: RoutineTaskProps) => {

  const [ routineNote, ] = useRoutineNoteState();

  // 루틴 클릭시
  const onClick = useCallback((task: RoutineTaskEntity) => {
    // 개별루틴 업데이트
    routineManager.updateAchievement({
      routineName: routineTask.name,
      day: routineNote.day,
      checked: task.checked
    });

    // 루틴노트 업데이트
    routineNoteService.checkTask(routineNote, routineTask.name, task.checked);
    routineNoteArchiver.save(routineNote);

    if(onTaskClick) onTaskClick(task);
  }, [routineTask.name, routineNote, onTaskClick])

  // option 클릭시
  const onOptionClick = useCallback(async () => {
    const routine = await routineManager.get(routineTask.name);
    openRoutineOptionModal(routine);
  }, [routineTask])

  return (
    <Task
      className="dr-routine-task"
      task={routineTask}
      onOptionClick={onOptionClick}
      onTaskClick={onClick}
    />
  )
});