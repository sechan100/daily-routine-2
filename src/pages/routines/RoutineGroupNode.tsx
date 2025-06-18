/** @jsxImportSource @emotion/react */
import { useDnd } from "@/components/dnd/use-dnd";
import { DragHandle } from "@/components/dr-node/DragHandle";
import { GroupDrNode, GroupDrNodeDndModule } from "@/components/dr-node/GroupDrNode";
import { openRoutineGroupControls } from "@/components/routine-group-controls/RoutineGroupControls";
import { routineTreeUtils } from "@/core/routine-tree/routine-tree-utils";
import { routineGroupRepository } from "@/entities/repository/group-repository";
import { NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { RoutineTree } from "@/entities/types/routine-tree";
import { ALL_ROUTINE_TREE_QUERY_KEY } from "@/stores/server/use-all-routine-tree-query";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback, useMemo } from "react";
import { RoutineDndItem } from "./model/dnd-item";
import { renderRoutineNodes } from "./render-routine-nodes";



type Props = {
  group: NoteRoutineGroup;
  depth: number;
}
export const RoutineGroupNode = ({
  group,
  depth,
}: Props) => {
  const queryClient = useQueryClient();

  const dndItem = useMemo<RoutineDndItem>(() => ({
    id: group.name,
    nrlType: "routine-group",
    routineGroup: group,
  }), [group]);

  const {
    isDragging,
    isOver,
    preDragState,
    setPreDragState,
    draggable,
    droppable,
    dndCase
  } = useDnd({
    dndItem,
    draggable: {
      type: "GROUP",
    },
    droppable: {
      accept: ["ROUTINE", "GROUP"],
      rectSplitCount: group.isOpen ? "two" : "three",
    }
  });

  const dndModule = useMemo<GroupDrNodeDndModule>(() => ({
    isDragging,
    isOver,
    droppable,
    preDragState,
    dndCase,
  }), [isDragging, isOver, droppable, preDragState, dndCase]);

  const handleOpen = useCallback(() => {
    queryClient.setQueryData<RoutineTree>(
      ALL_ROUTINE_TREE_QUERY_KEY,
      (prev) => {
        if (!prev) return prev;
        return produce(prev, (draft) => {
          const found = routineTreeUtils.findRoutineGroup(draft, group.name);
          found.isOpen = !found.isOpen;
        });
      }
    );
  }, [group, queryClient]);

  const handleContextMenu = useCallback(async () => {
    const sourceRoutineGroup = await routineGroupRepository.load(group.name);
    openRoutineGroupControls({ group: sourceRoutineGroup });
  }, [group.name]);

  return (
    <GroupDrNode
      group={group}
      depth={depth}
      dndModule={dndModule}
      onContextMenu={handleContextMenu}
      onOpenChange={handleOpen}
      optionIcons={[
        <DragHandle
          draggable={draggable}
          preDragState={preDragState}
          setPreDragState={setPreDragState}
        />
      ]}
    >
      {() => group.children.map(r => renderRoutineNodes(r, group, depth + 1))}
    </GroupDrNode >
  )
}