import { TodoTask as TodoTaskEntity } from "@entities/note";
import { AbstractTask } from "@features/task";
import React, { useCallback } from "react";
import { useTodoOptionModal } from './todo-option';


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