import { noteRepository, RoutineTree, useRoutineTreeStore } from "@/entities/note";
import { useCallback } from "react";
import { rippleRoutines } from "./ripple-routines";
import { RoutineTreeBuilder } from "./routine-tree-builder";



export type RippleRoutines = () => Promise<void>;

/**
 * 'rippleRoutine()'을 호출하고, useRoutineTreeStore의 상태를 업데이트한다.
 */
export const useRippleRoutines = () => {

  const ripple = useCallback(async () => {
    const { tree: { day } } = useRoutineTreeStore.getState();
    await rippleRoutines();
    let newRoutineTree: RoutineTree;
    const newNote = await noteRepository.load(day);
    if (newNote) {
      newRoutineTree = newNote.routienTree;
    } else {
      const routineBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
      newRoutineTree = routineBuilder.build(day);
    }
    useRoutineTreeStore.setState({ tree: newRoutineTree });
  }, []);

  return { ripple };
}