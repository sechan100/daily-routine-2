/** @jsxImportSource @emotion/react */
import { reorderTasks, taskCollisionResolver } from '@/features/task';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { useTaskQueue } from '../model/use-task-queue';
import { QueueTaskItem } from "./QueueTaskItem";


export const QueueList = () => {
  const { queue, updateTasks } = useTaskQueue();

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<BaseDndItem>) => {
    const newTasks = reorderTasks(queue.tasks, {
      active,
      over,
      dndCase,
    });
    await updateTasks(newTasks)
  }, [queue.tasks, updateTasks]);

  return (
    <DndContext
      itemTypes={["TASK"]}
      collisionResolver={taskCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      {queue.tasks.map(task => (
        <QueueTaskItem
          key={task.name}
          task={task}
        />
      ))}
    </DndContext>
  )
}