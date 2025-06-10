import { CheckableState, noteRepository, NoteRoutine, RoutineNote, RoutineTree, routineTreeUtils, useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { SETTINGS } from "@/shared/settings";
import { produce } from "immer";
import { useCallback } from "react";





type UseCheckRoutine = (noteRoutine: NoteRoutine) => {
  handleRoutineCheck: () => void;
}
export const useCheckRoutine: UseCheckRoutine = (noteRoutine) => {
  const day = useNoteDayStore(s => s.day);
  const tree = useRoutineTreeStore(s => s.tree);
  const setTree = useRoutineTreeStore(s => s.setTree);

  const handleRoutineCheck = useCallback(async () => {

    const updateCheckableState = (state: CheckableState) => produce(tree, (draft) => {
      const routine = routineTreeUtils.findRoutine(draft, noteRoutine.name);
      if (!routine) throw new Error("Check state change target routine not found");
      routine.state = state;
      return draft;
    });

    let newTree: RoutineTree;
    // dispatch check state change
    // un-check
    if (noteRoutine.state === "unchecked") {
      newTree = updateCheckableState("accomplished");
    }
    // accomplished & failed
    else if (noteRoutine.state === "accomplished" || noteRoutine.state === "failed") {
      let doUncheck = true;
      if (SETTINGS.getConfirmUncheckTask()) {
        doUncheck = await doConfirm({
          title: "Uncheck Task",
          description: "Are you sure you want to uncheck this task?",
          confirmText: "Uncheck",
          confirmBtnVariant: "accent",
        })
      }
      if (!doUncheck) {
        return;
      }
      newTree = updateCheckableState("unchecked");
    }
    else {
      throw new Error(`Unknown routine state: ${noteRoutine.state}`);
    }

    // note update
    await noteRepository.updateWith(day, (prev) => {
      const newNote: RoutineNote = {
        ...prev,
        routineTree: newTree,
      }
      return newNote;
    });

    // store update
    setTree(newTree);
  }, [noteRoutine.state, noteRoutine.name, day, setTree, tree]);

  return {
    handleRoutineCheck
  }
}
