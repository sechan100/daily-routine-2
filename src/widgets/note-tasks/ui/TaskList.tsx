/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { reorderTasks, taskCollisionResolver } from "../model/resolve-dnd";
import { useTasksStore } from "../model/tasks-store";
import { updateNewTasks } from "../model/update-new-tasks";
import { TaskItem } from "./TaskItem";


export const TaskList = () => {
  const day = useTasksStore(s => s.day);
  const tasks = useTasksStore(s => s.tasks);
  const { setTasks } = useTasksStore(s => s.actions);

  const handleDragEnd = useCallback(({ active, over, dndCase }: OnDragEndContext<BaseDndItem>) => {
    const newTasks = reorderTasks(tasks, {
      active,
      over,
      dndCase,
    });
    setTasks(newTasks);
    updateNewTasks(day, newTasks);
  }, [day, setTasks, tasks]);

  return (
    <DndContext
      collisionResolver={taskCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      <div css={{ overflowY: "auto" }}>
        {tasks.map(task => (
          <TaskItem
            key={task.name}
            task={task}
          />
        ))}
      </div>
    </DndContext>
  )
}