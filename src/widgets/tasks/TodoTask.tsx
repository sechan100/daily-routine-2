import { TodoTask as TodoTaskEntity, Task, useRoutineNote } from "entities/note";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback } from "react"
import { openTodoOptionModal } from 'features/todo';


interface TodoTaskProps {
  task: TodoTaskEntity;
}
export const TodoTask = React.memo(({ task }: TodoTaskProps) => {
  const { note, setNote } = useRoutineNote();
  
  const onOptionMenu = useCallback(async () => {
    openTodoOptionModal({
      note, 
      todo: task, 
      onDeleted: (note) => {
        setNote(note);
      }
    });
  }, [note, setNote, task])

  return (
    <AbstractTask 
      className="dr-todo-task"
      task={task}
      onOptionMenu={onOptionMenu}
    />
  )
});