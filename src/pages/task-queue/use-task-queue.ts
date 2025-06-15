import { taskQueueRepository } from "@/entities/repository/task-queue-repository";
import { TaskQueue } from "@/entities/types/task-queue";
import { taskQueueQueryKey, useTaskQueueQuery } from "@/stores/server/use-task-queue-query";
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