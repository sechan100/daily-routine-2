/** @jsxImportSource @emotion/react */
import { useNoteDayStore, useTasksStore } from '@/entities/note';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { reorderTasks, taskCollisionResolver } from "../model/resolve-dnd";
import { updateNewTasks } from "../model/update-new-tasks";
import { TaskItem } from "./TaskItem";


export const TaskListRoot = () => {
  const day = useNoteDayStore(s => s.day);
  const tasks = useTasksStore(s => s.tasks);
  const setTasks = useTasksStore(s => s.setTasks);

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