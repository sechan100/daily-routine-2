import { useRoutineTree } from "@/domain/note/use-routine-tree";
import { NoteRoutineGroup, isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { produce } from "immer";
import { useCallback } from "react";


export type UseOpenRoutineGroup = (routineGroup: NoteRoutineGroup) => {
  handleRoutineGroupOpen: (isOpen: boolean) => void;
}
export const useOpenRoutineGroup: UseOpenRoutineGroup = (routineGroup) => {
  const { updateTree, tree } = useRoutineTree();

  const handleRoutineGroupOpen = useCallback(async (isOpen: boolean) => {
    const newTree = produce(tree, (draftTree) => {
      for (const nrl of draftTree.root) {
        if (isNoteRoutineGroup(nrl) && nrl.name === routineGroup.name) {
          nrl.isOpen = isOpen;
        }
      }
      return draftTree;
    });
    // update tree
    await updateTree(newTree);
  }, [routineGroup.name, tree, updateTree]);

  return {
    handleRoutineGroupOpen,
  }
}