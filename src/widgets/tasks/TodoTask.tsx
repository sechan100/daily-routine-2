import { TodoTask as TodoTaskEntity, Task, useRoutineNote } from "@entities/note";
import { AbstractTask } from "./ui/AbstractTask";
import React, { useCallback } from "react"
import { useTodoOptionModal } from '@features/todo';


interface TodoTaskProps {
  task: TodoTaskEntity;
}
export const TodoTask = React.memo(({ task }: TodoTaskProps) => {
  const TodoOptionModal = useTodoOptionModal();
  
  const onOptionMenu = useCallback(async () => {
    TodoOptionModal.open({ todo: task });
  }, [TodoOptionModal, task])

  return (
    <>
      <AbstractTask 
        className="dr-todo-task"
        task={task}
        onOptionMenu={onOptionMenu}
      />
      <TodoOptionModal />
    </>
  )
});