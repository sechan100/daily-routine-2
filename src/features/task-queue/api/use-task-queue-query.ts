import { TaskQueue, taskQueueQueryKey, taskQueueRepository } from '@/entities/taks-queue';
import { useQuery } from '@tanstack/react-query';


const getFallbackQueue = (): TaskQueue => ({
  tasks: []
})

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