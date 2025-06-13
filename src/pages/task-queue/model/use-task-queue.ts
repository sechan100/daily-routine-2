import { TaskQueue, taskQueueQueryKey, taskQueueRepository } from "@/entities/taks-queue";
import { useTaskQueueQuery } from '@/features/task-queue';
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";



export const useTaskQueue = () => {
  const { queue } = useTaskQueueQuery();
  const queryClient = useQueryClient();

  const updateQueue = useCallback(async (newQueue: TaskQueue) => {
    await taskQueueRepository.update(newQueue);
    queryClient.setQueryData<TaskQueue>(
      taskQueueQueryKey,
      (prev) => {
        if (!prev) return prev;
        return newQueue;
      }
    );
  }, [queryClient]);

  return {
    queue,
    updateQueue,
  }
}