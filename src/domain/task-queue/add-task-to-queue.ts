import { queryClient } from "@/app/react-query/query-client";
import { taskQueueRepository } from "@/entities/repository/task-queue-repository";
import { Task } from "@/entities/types/task";
import { TaskQueue } from "@/entities/types/task-queue";
import { taskQueueQueryKey } from "@/stores/server/use-task-queue-query";


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