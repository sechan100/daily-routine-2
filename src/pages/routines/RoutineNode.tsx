/** @jsxImportSource @emotion/react */
import { useDnd } from "@/components/dnd/use-dnd";
import { CheckableDrNode, CheckableNodeDndState } from "@/components/dr-node/CheckableDrNode";
import { DragHandle } from "@/components/dr-node/DragHandle";
import { openRoutineControls } from "@/components/routine-controls/RoutineControls";
import { routineRepository } from "@/entities/repository/routine-repository";
import { NoteRoutine, NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { useCallback, useMemo } from "react";
import { RoutineDndItem } from "./model/dnd-item";


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

  const dndItem = useMemo<RoutineDndItem>(() => ({
    id: routine.name,
    nrlType: "routine",
    routine,
  }), [routine]);

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
      type: "ROUTINE",
    },
    droppable: {
      accept: depth === 0 ? ["ROUTINE", "GROUP"] : ["ROUTINE"],
      rectSplitCount: "two"
    }
  });

  const dndState = useMemo<CheckableNodeDndState>(() => ({
    isDragging,
    isOver,
    preDragState,
    dndCase
  }), [isDragging, isOver, preDragState, dndCase]);

  const handleContextMenu = useCallback(async () => {
    const sourceRoutine = await routineRepository.load(routine.name);
    openRoutineControls({ routine: sourceRoutine });
  }, [routine.name]);

  return (
    <CheckableDrNode
      checkable={routine}
      depth={depth}
      onContextMenu={handleContextMenu}
      checkAction={false}
      // dnd config
      ref={droppable}
      dndState={dndState}
      optionIcons={[
        ...optionIcons,
        <DragHandle
          draggable={draggable}
          preDragState={preDragState}
          setPreDragState={setPreDragState}
        />
      ]}
    />
  )
}