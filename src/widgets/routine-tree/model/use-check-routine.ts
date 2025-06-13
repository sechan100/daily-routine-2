import { CheckableState, NoteRoutine, routineTreeUtils } from "@/entities/note";
import { useRoutineTree } from '@/features/note';
import { confirmUncheckTask } from "@/shared/domain/confirm-uncheck-task";
import { useSettingsStores } from "@/shared/settings";
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
      if (!(await confirmUncheckTask())) {
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
