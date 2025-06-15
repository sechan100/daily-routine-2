/** @jsxImportSource @emotion/react */
import { reorderTasks, taskCollisionResolver } from "@/domain/task/resolve-dnd";
import { TaskQueue } from "@/entities/types/task-queue";
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";
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