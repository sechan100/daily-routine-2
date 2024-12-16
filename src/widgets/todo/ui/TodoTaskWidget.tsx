import { TaskGroup, TodoTask } from "@entities/note";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useTodoOptionModal } from '../todo-option';


interface TodoTaskProps {
  task: TodoTask;
  parent: TaskGroup | null;
}
export const TodoTaskWidget = React.memo(({ task, parent }: TodoTaskProps) => {
  const TodoOptionModal = useTodoOptionModal();
  
  const onOptionMenu = useCallback(async () => {
    TodoOptionModal.open({ todo: task });
  }, [TodoOptionModal, task])

  return (
    <>
      <BaseTaskFeature 
        task={task}
        parent={parent}
        className="dr-todo-task"
        onOptionMenu={onOptionMenu}
      />
      <TodoOptionModal />
    </>
  )
});