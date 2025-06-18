/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/components/dnd/DndContext";
import { BaseDndItem } from "@/components/dnd/drag-item";
import { reorderTasks, taskCollisionResolver } from "@/core/task/resolve-dnd";
import { TaskQueue } from "@/entities/types/task-queue";
import { useCallback } from "react";
import { QueueTaskItem } from "./QueueTaskItem";
import { useTaskQueue } from "./use-task-queue";


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
      draggableTypes={["TASK"]}
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