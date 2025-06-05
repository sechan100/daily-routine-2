import { CheckableState } from "../model/checkable";
import { RoutineNote } from "../model/note";
import { isNoteRoutine, isNoteRoutineGroup, NoteRoutine, NoteRoutineGroup, NoteRoutineLike } from "../model/note-routine-like";
import { RoutineTree } from "../model/routine-tree";

const findRoutineLike = (tree: RoutineTree, name: string): NoteRoutineLike | null => {
  for (const el of tree.root) {
    if (el.name === name) {
      return el;
    }
    if (isNoteRoutineGroup(el)) {
      const found = el.routines.find(r => r.name === name);
      if (found) return found;
    }
  }
  return null;
}


export interface RoutineTreeService {
  findRoutine: (tree: RoutineTree, name: string) => NoteRoutine | null;
  findRoutineGroup: (tree: RoutineTree, name: string) => NoteRoutineLike | null;
  setGroupOpen: (tree: RoutineTree, groupName: string, open: boolean) => RoutineTree;
  checkRoutine: (tree: RoutineTree, routineName: string, state: CheckableState) => RoutineTree;
  getParent: (tree: RoutineTree, routineName: string) => NoteRoutineGroup | null;
  getAllRoutines: (tree: RoutineTree) => NoteRoutine[];
}
export const routineTreeService: RoutineTreeService = {
  findRoutine: (tree: RoutineTree, name: string): NoteRoutine | null => {
    const routineLike = findRoutineLike(tree, name);
    if (isNoteRoutine(routineLike)) {
      return routineLike;
    }
    return null;
  },
  findRoutineGroup: (tree: RoutineTree, name: string): NoteRoutineLike | null => {
    const routineLike = findRoutineLike(tree, name);
    if (isNoteRoutineGroup(routineLike)) {
      return routineLike;
    }
    return null;
  },
  /**
   * groupName에 해당하는 NoteRoutineGroup을 지정한 open/close 상태로 변경하고 새로운 RoutineNote 객체를 반환한다.
   * @param note
   * @param groupName
   * @param open
   * @returns
   */
  setGroupOpen: (tree: RoutineTree, groupName: string, open: boolean): RoutineTree => {
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
  },
  checkRoutine: (tree: RoutineTree, routineName: string, state: CheckableState): RoutineTree => {
    const newTree = { ...tree };
    const routine = routineTreeService.findRoutine(newTree, routineName);
    if (!routine) throw new Error("Check state change target routine not found");
    routine.state = state;
    return newTree;
  },
  /**
   * routineLikeName에 해당하는 routine의 부모 RoutineGroup을 찾아 반환한다.
   * null을 반환하는 경우는 속하는 Group이 없고 root에 위치한 경우이다.
   * 
   * 아예 routine이 tree에 존재하지 않는 경우 에러
   * @param note
   * @param routineLikeName
   */
  getParent: (tree: RoutineTree, routineLikeName: string): NoteRoutineGroup | null => {
    for (const el of tree.root) {
      // root 직접 자식인 경우 - parent 없음
      if (el.name === routineLikeName) {
        return null;
      }

      // 그룹 내부에서 찾는 경우 - 해당 그룹이 parent
      if (isNoteRoutineGroup(el)) {
        for (const r of el.routines) {
          if (r.name === routineLikeName) {
            return el;
          }
        }
      }
    }

    // 전체 트리에서 찾지 못한 경우
    throw new Error(`RoutineLike with name ${routineLikeName} not found in the tree`);
  },
  getAllRoutines: (noteOrTree: RoutineNote | RoutineTree): NoteRoutine[] => {
    const root = "root" in noteOrTree ? noteOrTree.root : noteOrTree.routienTree.root;
    const routines: NoteRoutine[] = [];
    for (const el of root) {
      if (isNoteRoutine(el)) {
        routines.push(el);
      }
      else if (isNoteRoutineGroup(el)) {
        routines.push(...el.routines);
      }
      else {
        throw new Error('Invalid RoutineLike Type');
      }
    }
    return routines;
  }

}