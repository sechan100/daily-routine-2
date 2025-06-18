/** @jsxImportSource @emotion/react */
import { GroupDrNode } from "@/components/dr-node/GroupDrNode";
import { openRoutineGroupControls } from "@/components/routine-group-controls/RoutineGroupControls";
import { routineGroupRepository } from "@/entities/repository/group-repository";
import { isNoteRoutineGroup, NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { useRoutineTree } from "@/service/use-routine-tree";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { produce } from "immer";
import { Notice } from "obsidian";
import { useCallback } from "react";
import { renderRoutineTree } from "./render-routine-tree";



type Props = {
  group: NoteRoutineGroup;
  depth: number;
}
export const RoutineGroupNode = ({
  group,
  depth,
}: Props) => {
  const day = useNoteDayStore(s => s.day);
  const { updateTree, tree } = useRoutineTree();

  const handleOpen = useCallback(async (isOpen: boolean) => {
    const newTree = produce(tree, draftTree => {
      for (const nrl of draftTree.root) {
        if (isNoteRoutineGroup(nrl) && nrl.name === group.name) {
          nrl.isOpen = isOpen;
        }
      }
      return draftTree;
    });
    // update tree
    await updateTree(newTree);
  }, [group.name, tree, updateTree]);


  const handleContextMenu = useCallback(async () => {
    // 과거의 RoutineGroup은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine group control cannot be opened for past routines.");
      return;
    }
    const sourceRoutineGroup = await routineGroupRepository.load(group.name);
    openRoutineGroupControls({ group: sourceRoutineGroup });
  }, [day, group.name]);

  return (
    <GroupDrNode
      group={group}
      depth={depth}
      onContextMenu={handleContextMenu}
      onOpenChange={handleOpen}
      optionIcons={[]}
    >
      {() => group.children.map(r => renderRoutineTree(r, group, depth + 1))}
    </GroupDrNode >
  )
}