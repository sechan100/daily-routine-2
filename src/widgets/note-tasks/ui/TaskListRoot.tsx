/** @jsxImportSource @emotion/react */
import { useNoteTasks } from '@/features/note';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { reorderTasks, taskCollisionResolver } from "../model/resolve-dnd";
import { TaskItem } from "./TaskItem";


export const TaskListRoot = () => {
  const { tasks, updateTasks } = useNoteTasks();

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<BaseDndItem>) => {
    const newTasks = reorderTasks(tasks, {
      active,
      over,
      dndCase,
    });
    await updateTasks(newTasks)
  }, [tasks, updateTasks]);

  return (
    <DndContext
      itemTypes={["TASK"]}
      collisionResolver={taskCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      {tasks.map(task => (
        <TaskItem
          key={task.name}
          task={task}
        />
      ))}
    </DndContext>
  )
}