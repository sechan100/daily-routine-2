/** @jsxImportSource @emotion/react */
import { useDnd } from "@/components/dnd/use-dnd";
import { CheckableDrNode, CheckableNodeDndState } from "@/components/dr-node/CheckableDrNode";
import { DragHandle } from "@/components/dr-node/DragHandle";
import { routineRepository } from "@/entities/repository/routine-repository";
import { NoteRoutine, NoteRoutineGroup } from "@/entities/types/note-routine-like";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { useRoutineTreeContext } from "./context";
import { RoutineDndItem } from "./dnd-item";
import { useCheckRoutine } from "./use-check-routine";


type Props = {
  routine: NoteRoutine;
  parent: NoteRoutineGroup | null;
  depth: number;
  optionIcons?: React.ReactNode[];
}
export const RoutineItem = ({
  routine,
  // parent,
  depth,
  optionIcons = [],
}: Props) => {
  const day = useNoteDayStore(s => s.day);
  const { changeRoutineState } = useCheckRoutine(routine);
  const { openRoutineControls } = useRoutineTreeContext();

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

  /**
   * Context Menu를 열면 routine control을 연다
   */
  const handleContextMenu = useCallback(async () => {
    // 과거의 루틴은 현재 존재하지 않을 수 있으므로 control을 열지 않음.
    if (day.isPast()) {
      new Notice("Routine control cannot be opened for past routines.");
      return;
    }
    const sourceRoutine = await routineRepository.load(routine.name);
    openRoutineControls(sourceRoutine);
  }, [day, openRoutineControls, routine.name]);

  return (
    <CheckableDrNode
      checkable={routine}
      depth={depth}
      onStateChange={changeRoutineState}
      onContextMenu={handleContextMenu}
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