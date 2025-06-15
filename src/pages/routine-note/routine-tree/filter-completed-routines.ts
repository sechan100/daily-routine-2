import { isNoteRoutine, isNoteRoutineGroup, NoteRoutine, NoteRoutineGroup, NoteRoutineLike } from "@/entities/types/note-routine-like";
import { RoutineTree } from "@/entities/types/routine-tree";


const flatMapFilter = (routines: NoteRoutineLike[]): NoteRoutineLike[] => {
  return routines.flatMap(nrl => {
    if (isNoteRoutine(nrl)) {
      return nrl.state === "unchecked" ? nrl : [];
    } else if (isNoteRoutineGroup(nrl)) {
      const filteredChildren: NoteRoutine[] = flatMapFilter(nrl.routines) as NoteRoutine[];
      const newGroup: NoteRoutineGroup = { ...nrl, routines: filteredChildren }
      return filteredChildren.length > 0 ? newGroup : [];
    } else {
      throw new Error(`Unknown NoteRoutineLike type: ${JSON.stringify(nrl)}`);
    }
  });
}


/**
 * 1차 트리구조인 routine tree.root에서 완료된 루틴들과 그 결과 비어있게된 group들을 필터링한다.
 */
export const filterCompletedRoutines = (tree: RoutineTree): RoutineTree => {
  const filteredRoot = flatMapFilter(tree.root);
  return {
    ...tree,
    root: filteredRoot,
  };
}