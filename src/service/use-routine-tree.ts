import { noteRepository } from "@/entities/repository/note-repository";
import { RoutineNote } from "@/entities/types/note";
import { RoutineTree } from "@/entities/types/routine-tree";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { routineNoteQueryKeys, useRoutineNoteQuery } from "@/stores/server/use-routine-note-query";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback } from "react";
import { useRipple } from "./use-ripple";


export const useRoutineTree = () => {
  const day = useNoteDayStore(s => s.day);
  const queryClient = useQueryClient();
  const { note } = useRoutineNoteQuery(day);
  const { ripple } = useRipple();


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
      }
    );
  }, [note, day, queryClient]);

  return {
    day,
    tree: note.routineTree,
    ripple,
    updateTree
  }
}