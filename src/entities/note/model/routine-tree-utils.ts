import { RoutineNote } from "../types/note";
import { isNoteRoutine, isNoteRoutineGroup, NoteRoutine, NoteRoutineGroup, NoteRoutineLike } from "../types/note-routine-like";
import { RoutineTree } from "../types/routine-tree";

class RoutineTreeUtils {
  findRoutineLike(tree: RoutineTree, name: string): NoteRoutineLike | null {
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

  findRoutine(tree: RoutineTree, name: string): NoteRoutine | null {
    const routineLike = this.findRoutineLike(tree, name);
    if (isNoteRoutine(routineLike)) {
      return routineLike;
    }
    return null;
  }

  findRoutineGroup(tree: RoutineTree, name: string): NoteRoutineLike | null {
    const routineLike = this.findRoutineLike(tree, name);
    if (isNoteRoutineGroup(routineLike)) {
      return routineLike;
    }
    return null;
  }

  /**
   * routineLikeName에 해당하는 routine의 부모 RoutineGroup을 찾아 반환한다.
   * null을 반환하는 경우는 속하는 Group이 없고 root에 위치한 경우이다.
   * 
   * 아예 routine이 tree에 존재하지 않는 경우 에러
   * @param note
   * @param routineLikeName
   */
  getParent(tree: RoutineTree, routineLikeName: string): NoteRoutineGroup | null {
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
  }

  getAllRoutines(noteOrTree: RoutineNote | RoutineTree): NoteRoutine[] {
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

export const routineTreeUtils = new RoutineTreeUtils();