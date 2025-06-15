import { taskQueueRepository } from '@/entities/repository/task-queue-repository';
import { TaskQueue } from '@/entities/types/task-queue';
import { useQuery } from '@tanstack/react-query';


const getFallbackQueue = (): TaskQueue => ({
  tasks: []
})


export const taskQueueQueryKey = ["task-queue"];

export const useTaskQueueQuery = () => {
  const query = useQuery({
    queryKey: taskQueueQueryKey,
    queryFn: async () => await taskQueueRepository.load(),
  });

  return {
    queue: query.data ?? getFallbackQueue(),
    query
  }
}