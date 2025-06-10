import { isNoteRoutineGroup, noteRepository, NoteRoutineGroup, useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { produce } from "immer";
import { useCallback } from "react";



export type UseOpenRoutineGroup = (routineGroup: NoteRoutineGroup) => {
  handleRoutineGroupOpen: () => void;
}
export const useOpenRoutineGroup: UseOpenRoutineGroup = (routineGroup) => {
  const day = useNoteDayStore(s => s.day);
  const tree = useRoutineTreeStore(s => s.tree);
  const setTree = useRoutineTreeStore(s => s.setTree);

  const handleRoutineGroupOpen = useCallback(() => {
    const newTree = produce(tree, (draftTree) => {
      for (const nrl of draftTree.root) {
        if (isNoteRoutineGroup(nrl) && nrl.name === routineGroup.name) {
          nrl.isOpen = !nrl.isOpen;
        }
      }
      return draftTree;
    });

    // note update
    noteRepository.updateWith(day, prevNote => {
      return produce(prevNote, (draftNote) => {
        draftNote.routineTree = newTree;
      });
    });

    // store update
    setTree(newTree);
  }, [day, routineGroup.name, setTree, tree]);

  return {
    handleRoutineGroupOpen,
  }
}