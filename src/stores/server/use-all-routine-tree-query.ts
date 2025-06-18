import { RoutineTreeBuilder } from '@/core/routine-tree/routine-tree-builder';
import { RoutineTree } from '@/entities/types/routine-tree';
import { useQuery } from "@tanstack/react-query";


export const ALL_ROUTINE_TREE_QUERY_KEY = ['all-routine-tree', 7] as const;

export const useAllRoutineTreeQuery = () => {
  const query = useQuery<RoutineTree>({
    queryKey: ALL_ROUTINE_TREE_QUERY_KEY,
    queryFn: async () => {
      const treeBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
      const allRoutines = treeBuilder.getRoutines();
      return treeBuilder.buildWithRoutines(allRoutines, true);
    }
  });

  return {
    allRoutineTree: query.data ?? {
      root: [],
    },
    query,
  }
}