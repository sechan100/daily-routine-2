/** @jsxImportSource @emotion/react */
import { TaskQueue } from '@/entities/taks-queue';
import { reorderTasks, taskCollisionResolver } from '@/features/task';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
import { useCallback } from "react";
import { useTaskQueue } from '../model/use-task-queue';
import { QueueTaskItem } from "./QueueTaskItem";


export const QueueList = () => {
  const { queue, updateQueue } = useTaskQueue();

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<BaseDndItem>) => {
    const newTasks = reorderTasks(queue.tasks, {
      active,
      over,
      dndCase,
    });
    const newQueue: TaskQueue = {
      ...queue,
      tasks: newTasks,
    };
    await updateQueue(newQueue);
  }, [queue, updateQueue]);

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