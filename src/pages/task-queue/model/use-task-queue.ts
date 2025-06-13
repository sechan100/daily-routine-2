import { TaskQueue, taskQueueQueryKey, taskQueueRepository } from "@/entities/taks-queue";
import { Task } from "@/entities/task";
import { Day } from "@/shared/period/day";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTaskQueueQuery } from "../api/use-task-queue-query";
import { scheduleTask as scheduleTaskLogic } from "./schedule-task";



export const useTaskQueue = () => {
  const { queue } = useTaskQueueQuery();
  const queryClient = useQueryClient();

  const updateTasks = useCallback(async (newTasks: Task[]) => {
    const newQueue: TaskQueue = {
      tasks: newTasks
    }
    await taskQueueRepository.update(newQueue);
    queryClient.setQueryData<TaskQueue>(
      taskQueueQueryKey,
      (prev) => {
        if (!prev) return prev;
        return newQueue;
      });
  }, [queryClient]);

  const scheduleTask = useCallback(async (day: Day, task: Task) => {
    const newTasks = await scheduleTaskLogic(queue.tasks, day, task);
    await updateTasks(newTasks);
  }, [queue.tasks, updateTasks]);

  return {
    queue,
    updateTasks,
    scheduleTask
  }
}