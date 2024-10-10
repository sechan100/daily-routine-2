import { routineManager } from "entities/routine";
import { RoutineNote, RoutineTask as RoutineTaskEntity } from "entities/routine-note"
import { openRoutineOptionModal } from "features/routine-option";
import { RoutineTask } from "features/tasks"
import { useCallback } from "react";




interface RoutineTaskWidgetProps {
  routineNote: RoutineNote;
  task: RoutineTaskEntity;
  onTaskClick?: (task: RoutineTaskEntity) => void;
}
export const RoutineTaskWidget = ({ routineNote, task, onTaskClick }: RoutineTaskWidgetProps) => {


  const onContextMenu = useCallback(async (e: React.MouseEvent) => {
    const routine = await routineManager.get(task.name);
    openRoutineOptionModal(routine);
  }, [task.name]);


  return (
    <RoutineTask 
      routineNote={routineNote}
      task={task} 
      onContextMenu={onContextMenu}
      onTaskClick={onTaskClick}
    />
  )
}