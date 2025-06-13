import { TaskQueue, taskQueueQueryKey, taskQueueRepository } from "@/entities/taks-queue";
import { Task } from "@/entities/task";
import { queryClient } from "@/shared/react-query/query-client";





export const addTaskToQueue = async (taskName: string) => {
  const queue = await taskQueueRepository.load();
  const newTask: Task = {
    name: taskName,
    state: "unchecked",
    properties: {
      showOnCalendar: true,
    },
  }
  const newQueue: TaskQueue = {
    ...queue,
    tasks: [newTask, ...queue.tasks],
  }
  queryClient.setQueryData<TaskQueue>(taskQueueQueryKey, newQueue)
  await taskQueueRepository.update(newQueue);
}