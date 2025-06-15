/** @jsxImportSource @emotion/react */
import { CheckableItem } from "@/components/checkable/CheckableItem";
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
    <CheckableItem
      checkable={routine}
      depth={depth}
      draggableType="ROUTINE"
      droppableAccept={depth === 0 ? ["ROUTINE", "GROUP"] : ["ROUTINE"]}
      dndItem={dndItem}
      onStateChange={changeRoutineState}
      onContextMenu={handleContextMenu}
      optionIcons={optionIcons}
    />
  )
}