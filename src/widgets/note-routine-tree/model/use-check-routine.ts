import { noteRepository, NoteRoutine, RoutineNote, routineTreeUtils, useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { SETTINGS } from "@/shared/settings";
import { useCallback } from "react";





type UseCheckRoutine = (noteRoutine: NoteRoutine) => {
  handleRoutineClick: () => void;
}
export const useCheckRoutine: UseCheckRoutine = (noteRoutine) => {
  const day = useNoteDayStore(s => s.day);
  const routineName = noteRoutine.name;
  const tree = useRoutineTreeStore(s => s.tree);
  const setTree = useRoutineTreeStore(s => s.setTree);

  const handleRoutineClick = useCallback(async () => {
    const newTree = { ...tree };
    const routine = routineTreeUtils.findRoutine(newTree, routineName);
    if (!routine) throw new Error("Check state change target routine not found");

    // dispatch check state change
    // un-check
    if (routine.state === "unchecked") {
      routine.state = "accomplished";
    }
    // accomplished & failed
    else if (routine.state === "accomplished" || routine.state === "failed") {
      let doUncheck = true;
      if (SETTINGS.getConfirmUncheckTask()) {
        doUncheck = await doConfirm({
          title: "Uncheck Task",
          description: "Are you sure you want to uncheck this task?",
          confirmText: "Uncheck",
          confirmBtnVariant: "accent",
        })
      }
      if (doUncheck) {
        routine.state = "unchecked";
      }
    }
    else {
      throw new Error(`Unknown routine state: ${routine.state}`);
    }
    // data 업데이트
    await noteRepository.updateWith(day, (prev) => {
      const newNote: RoutineNote = {
        ...prev,
        routineTree: newTree
      }
      return newNote;
    });
    // 상태 업데이트
    setTree(newTree);
  }, [tree, routineName, day, setTree]);

  return {
    handleRoutineClick
  }
}
