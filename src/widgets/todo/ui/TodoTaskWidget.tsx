import { TaskGroupDto, TodoTaskDto } from "@entities/note";
import { AbstractTaskWidget } from "@features/task-el";
import React, { useCallback } from "react";
import { useTodoOptionModal } from './todo-option';


interface TodoTaskProps {
  task: TodoTaskDto;
  parent: TaskGroupDto | null;
}
export const TodoTaskWidget = React.memo(({ task, parent }: TodoTaskProps) => {
  const TodoOptionModal = useTodoOptionModal();
  
  const onOptionMenu = useCallback(async () => {
    TodoOptionModal.open({ todo: task });
  }, [TodoOptionModal, task])

  return (
    <>
      <AbstractTaskWidget 
        task={task}
        parent={parent}
        className="dr-todo-task"
        onOptionMenu={onOptionMenu}
      />
      <TodoOptionModal />
    </>
  )
});