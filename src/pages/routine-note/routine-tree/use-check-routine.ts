import { confirmUncheckCheckable } from "@/domain/checkable/confirm-uncheck-checkable";
import { routineTreeUtils } from "@/domain/note/routine-tree-utils";
import { useRoutineTree } from "@/domain/note/use-routine-tree";
import { CheckableState } from "@/entities/types/checkable";
import { NoteRoutine } from "@/entities/types/note-routine-like";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { produce } from "immer";
import { useCallback } from "react";





type UseCheckRoutine = (noteRoutine: NoteRoutine) => {
  changeRoutineState: (state: CheckableState) => void;
}
export const useCheckRoutine: UseCheckRoutine = (noteRoutine) => {
  const { updateTree, tree } = useRoutineTree();

  const changeRoutineState = useCallback(async (newState: CheckableState) => {
    if (
      newState === "unchecked" &&
      useSettingsStores.getState().confirmUncheckTask
    ) {
      if (!(await confirmUncheckCheckable())) {
        return;
      }
    }

    const newTree = produce(tree, (draft) => {
      const routine = routineTreeUtils.findRoutine(draft, noteRoutine.name);
      if (!routine) throw new Error("Check state change target routine not found");
      routine.state = newState;
    });
    await updateTree(newTree);
  }, [noteRoutine.name, updateTree, tree]);

  return {
    changeRoutineState
  }
}
