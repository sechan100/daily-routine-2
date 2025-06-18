import { rippleRoutines } from "@/core/note/ripple-routines";
import { ALL_ROUTINE_TREE_QUERY_KEY } from "@/stores/server/use-all-routine-tree-query";
import { routineNoteQueryKeys } from "@/stores/server/use-routine-note-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";






export const useRipple = () => {
  const queryClient = useQueryClient();

  const ripple = useCallback(async () => {
    await rippleRoutines();
    queryClient.invalidateQueries({
      queryKey: ALL_ROUTINE_TREE_QUERY_KEY,
      type: "all",
    });
    queryClient.invalidateQueries({
      queryKey: routineNoteQueryKeys.all,
      type: "all",
    });
  }, [queryClient]);

  return {
    ripple,
  }
}