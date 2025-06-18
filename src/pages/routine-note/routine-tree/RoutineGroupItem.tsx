/** @jsxImportSource @emotion/react */
import { useDnd } from "@/components/dnd/use-dnd";
import { DragHandle } from "@/components/dr-node/DragHandle";
import { GroupDrNode, GroupDrNodeDndModule } from "@/components/dr-node/GroupDrNode";
import { routineGroupRepository } from "@/entities/repository/group-repository";
import { NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { useRoutineTreeContext } from "./context";
import { RoutineDndItem } from "./dnd-item";
import { renderRoutineTree } from "./render-routine-tree";
import { useOpenRoutineGroup } from "./use-open-routine-group";



type Props = {
  group: NoteRoutineGroup;
  depth: number;
}
export const RoutineGroupItem = ({
  group,
  depth,
}: Props) => {
  const day = useNoteDayStore(s => s.day);
  const { openRoutineGroupControls } = useRoutineTreeContext();
  const { handleRoutineGroupOpen } = useOpenRoutineGroup(group);

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
    handleRoutineGroupOpen(!group.isOpen);
  }, [group.isOpen, handleRoutineGroupOpen]);

  /**
   * Context Menu를 열면 routine control을 연다
   */
  const handleContextMenu = useCallback(async () => {
    // 과거의 RoutineGroup은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine group control cannot be opened for past routines.");
      return;
    }
    const sourceRoutineGroup = await routineGroupRepository.load(group.name);
    openRoutineGroupControls(sourceRoutineGroup);
  }, [day, group.name, openRoutineGroupControls]);

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
      {() => group.children.map(r => renderRoutineTree(r, group, depth + 1))}
    </GroupDrNode >
  )
}