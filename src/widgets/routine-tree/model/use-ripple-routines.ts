import { noteRepository, RoutineTree, useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { rippleRoutines, RoutineTreeBuilder } from '@/features/note';
import { useCallback } from "react";



export type RippleRoutines = () => Promise<void>;

/**
 * 'rippleRoutine()'을 호출하고, useRoutineTreeStore의 상태를 업데이트한다.
 */
export const useRippleRoutineTree = () => {
  const day = useNoteDayStore(s => s.day);
  const setTree = useRoutineTreeStore(s => s.setTree);

  const ripple = useCallback(async () => {
    await rippleRoutines();
    let newRoutineTree: RoutineTree;
    const newNote = await noteRepository.load(day);
    if (newNote) {
      newRoutineTree = newNote.routineTree;
    } else {
      const routineBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
      newRoutineTree = routineBuilder.build(day);
    }
    setTree(newRoutineTree);
  }, [day, setTree]);

  return { ripple };
}