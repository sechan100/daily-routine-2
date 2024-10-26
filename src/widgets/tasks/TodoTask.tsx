import { TodoTask as TodoTaskEntity, Task, useRoutineNote } from "entities/note";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback } from "react"
import { openTodoOptionModal } from 'features/todo';


interface TodoTaskProps {
  task: TodoTaskEntity;
}
export const TodoTask = React.memo(({ task }: TodoTaskProps) => {
  const { note, setNoteAndSave} = useRoutineNote();

  const onClick = useCallback((task: TodoTaskEntity) => {
    // 필요시..
  }, [])

  const onOptionMenu = useCallback(async () => {
    openTodoOptionModal({
      note, 
      todo: task, 
      onDeleted: (note) => setNoteAndSave(note)
    });
  }, [note, setNoteAndSave, task])

  const onTaskReorder = useCallback(async (tasks: Task[]) => {
    setNoteAndSave({
      ...note,
      tasks
    })
  }, [note, setNoteAndSave])

  return (
    <AbstractTask 
      onTaskReorder={onTaskReorder}
      className="dr-todo-task"
      task={task}
      onOptionMenu={onOptionMenu}
      onTaskClick={onClick}
    />
  )
});