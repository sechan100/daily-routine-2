import { RoutineNote, Task, } from "entities/routine-note";
import { RoutineTask, TaskContext } from "features/task";
import React from "react";
import { UseStateRv } from "shared/zustand/create-use-state-synced-store";





interface TaskListProps {
  useRoutineNoteState: UseStateRv<RoutineNote>;
  onTaskClick?: (task: Task) => void;
}
export const TaskList = React.memo(({ useRoutineNoteState, onTaskClick}: TaskListProps) => {
  

  return (
    <TaskContext useRoutineNoteState={useRoutineNoteState}>
      {
        useRoutineNoteState.state.tasks.map(task => {
          if(task.type === "routine"){
            return (
              <RoutineTask 
                key={task.name}
                routineTask={task} 
                onTaskClick={() => {
                  if(onTaskClick) onTaskClick(task)
                }} 
              />
            )
          }
        })
      }
    </TaskContext>
  )
});