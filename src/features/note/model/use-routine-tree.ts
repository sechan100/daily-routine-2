import { noteRepository, RoutineNote, routineNoteQueryKeys, RoutineTree, useNoteDayStore } from "@/entities/note";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback } from "react";
import { useRoutineNoteQuery } from "../api/use-routine-note-query";
import { rippleRoutines } from "./ripple-routines";



export const useRoutineTree = () => {
  const day = useNoteDayStore(s => s.day);
  const queryClient = useQueryClient();
  const { note } = useRoutineNoteQuery(day);

  const ripple = useCallback(async () => {
    await rippleRoutines();
    queryClient.invalidateQueries({
      queryKey: routineNoteQueryKeys.all,
    });
  }, [queryClient]);

  const updateTree = useCallback(async (newTree: RoutineTree) => {
    const newNote: RoutineNote = produce(note, (draft) => {
      draft.routineTree = newTree;
    });
    await noteRepository.update(newNote);
    queryClient.setQueryData<RoutineNote>(
      routineNoteQueryKeys.note(day),
      (prev) => {
        if (!prev) return prev;
        return newNote;
      });
  }, [note, day, queryClient]);

  return {
    day,
    tree: note.routineTree,
    ripple,
    updateTree
  }
}