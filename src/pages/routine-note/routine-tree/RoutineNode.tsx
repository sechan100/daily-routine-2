/** @jsxImportSource @emotion/react */
import { CheckableDrNode } from "@/components/dr-node/CheckableDrNode";
import { openRoutineControls } from "@/components/routine-controls/RoutineControls";
import { confirmUncheckCheckable } from "@/core/checkable/confirm-uncheck-checkable";
import { routineTreeUtils } from "@/core/routine-tree/routine-tree-utils";
import { routineRepository } from "@/entities/repository/routine-repository";
import { CheckableState } from "@/entities/types/dr-nodes";
import { NoteRoutine, NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { useRoutineTree } from "@/service/use-routine-tree";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { produce } from "immer";
import { Notice } from "obsidian";
import { useCallback } from "react";


type Props = {
  routine: NoteRoutine;
  parent: NoteRoutineGroup | null;
  depth: number;
  optionIcons?: React.ReactNode[];
}
export const RoutineNode = ({
  routine,
  // parent,
  depth,
  optionIcons = [],
}: Props) => {
  const day = useNoteDayStore(s => s.day);
  const { updateTree, tree } = useRoutineTree();

  const changeRoutineState = useCallback(async (newState: CheckableState) => {
    if (newState === "unchecked" && useSettingsStores.getState().confirmUncheckTask) {
      if (!(await confirmUncheckCheckable())) {
        return;
      }
    }
    const newTree = produce(tree, (draft) => {
      const r = routineTreeUtils.findRoutine(draft, routine.name);
      if (!r) throw new Error("Check state change target routine not found");
      r.state = newState;
    });
    await updateTree(newTree);
  }, [tree, updateTree, routine.name]);


  const handleContextMenu = useCallback(async () => {
    // 과거의 루틴은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine control cannot be opened for past routines.");
      return;
    }
    const sourceRoutine = await routineRepository.load(routine.name);
    openRoutineControls({ routine: sourceRoutine });
  }, [day, routine.name]);

  return (
    <CheckableDrNode
      checkable={routine}
      depth={depth}
      onStateChange={changeRoutineState}
      onContextMenu={handleContextMenu}
      optionIcons={[]}
    />
  )
}