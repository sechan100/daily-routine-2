import { confirmUncheckCheckable } from "@/core/checkable/confirm-uncheck-checkable";
import { routineTreeUtils } from "@/core/routine-tree/routine-tree-utils";
import { CheckableState } from "@/entities/types/dr-nodes";
import { NoteRoutine } from "@/entities/types/note-routine-like";
import { useRoutineTree } from "@/service/use-routine-tree";
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
