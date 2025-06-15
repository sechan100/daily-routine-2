import { isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { RoutineTree } from "@/entities/types/routine-tree";

/**
 * groupName에 해당하는 NoteRoutineGroup을 지정한 open/close 상태로 변경하고 새로운 RoutineNote 객체를 반환한다.
 * @param note
 * @param groupName
 * @param open
 * @returns
 */
export const openGroup = (tree: RoutineTree, groupName: string, open: boolean): RoutineTree => {
  const newTree = { ...tree };
  newTree.root = newTree.root.map(routineLike => {
    // Group이면서 이름이 일치한다면 상태를 open으로 변경
    if (isNoteRoutineGroup(routineLike) && routineLike.name === groupName) {
      return { ...routineLike, isOpen: open };
    } else {
      return routineLike;
    }
  });
  return newTree;
}
