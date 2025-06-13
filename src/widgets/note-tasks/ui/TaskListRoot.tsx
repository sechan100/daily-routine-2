/** @jsxImportSource @emotion/react */
import { useNoteTasks } from '@/features/note';
import { reorderTasks, taskCollisionResolver } from '@/features/task';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { NoteTaskItem } from "./NoteTaskItem";


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
        <NoteTaskItem
          key={task.name}
          task={task}
        />
      ))}
    </DndContext>
  )
}