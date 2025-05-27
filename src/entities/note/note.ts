/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day } from "@/shared/period/day";
import { NoteRoutine, NoteRoutineGroup, NoteRoutineLike, noteRoutineLikeTypeGuards } from "./note-routine-like";
import { Task } from "./task";


export type RoutineNote = {

  day: Day;

  /**
   * RoutineNote의 데이터 영역을 제외한 부분의 전체 markdown 문자열
   */
  content: string;

  tasks: Task[];

  /**
   * Routine, RoutineGroup을 포함한 Root 배열
   */
  routineRoot: NoteRoutineLike[];
}

export const isRoutineNote = (routineNote: any): routineNote is RoutineNote => {
  const hasDay = routineNote.day instanceof Day;
  const hasRoot = Array.isArray(routineNote.children);
  return hasDay && hasRoot;
}

const findRoutineLike = (note: RoutineNote, name: string): NoteRoutineLike | null => {
  for (const el of note.routineRoot) {
    if (el.name === name) {
      return el;
    }
    if (noteRoutineLikeTypeGuards.isGroup(el)) {
      const found = el.routines.find(r => r.name === name);
      if (found) return found;
    }
  }
  return null;
}



interface NoteService {
  // Tasks
  findTask: (note: RoutineNote, name: string) => Task | null;
  updateTask: (note: RoutineNote, taskName: string, replacer: (task: Task) => Task) => RoutineNote;
  removeTask: (note: RoutineNote, name: string) => RoutineNote;

  // Routines
  findRoutine: (note: RoutineNote, name: string) => NoteRoutine | null;
  findRoutineGroup: (note: RoutineNote, name: string) => NoteRoutineLike | null;
  setGroupOpen: (note: RoutineNote, groupName: string, open: boolean) => RoutineNote;
  findRoutineParent: (note: RoutineNote, routineName: string) => NoteRoutineGroup | null;
  getAllRoutines: (note: RoutineNote) => NoteRoutine[];
}
export const noteService: NoteService = {

  findTask: (note: RoutineNote, name: string): Task | null => {
    for (const el of note.tasks) {
      if (el.name === name) {
        return el;
      }
    }
    return null;
  },

  updateTask: (note: RoutineNote, taskName: string, replacer: (task: Task) => Task): RoutineNote => {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.map(task => {
      if (task.name === taskName) {
        return replacer(task);
      } else {
        return task;
      }
    });
    return newNote;
  },

  removeTask: (note: RoutineNote, name: string): RoutineNote => {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.filter(task => task.name !== name);
    return newNote;
  },

  findRoutine: (note: RoutineNote, name: string): NoteRoutine | null => {
    const routineLike = findRoutineLike(note, name);
    if (noteRoutineLikeTypeGuards.isRoutine(routineLike)) {
      return routineLike;
    }
    return null;
  },

  findRoutineGroup: (note: RoutineNote, name: string): NoteRoutineLike | null => {
    const routineLike = findRoutineLike(note, name);
    if (noteRoutineLikeTypeGuards.isGroup(routineLike)) {
      return routineLike;
    }
    return null;
  },

  /**
   * routineName에 해당하는 routine의 부모 RoutineGroup을 찾아 반환한다.
   * null을 반환하는 경우는 Group이 없는 경우이다.
   * @param note 
   * @param routineName 
   */
  findRoutineParent: (note: RoutineNote, routineName: string): NoteRoutineGroup | null => {
    for (const el of note.routineRoot) {
      if (noteRoutineLikeTypeGuards.isGroup(el)) {
        const found = el.routines.find(r => r.name === routineName);
        if (found) {
          return el;
        }
      }
    }
    return null;
  },

  getAllRoutines: (note: RoutineNote): NoteRoutine[] => {
    const routines: NoteRoutine[] = [];
    for (const el of note.routineRoot) {
      if (noteRoutineLikeTypeGuards.isRoutine(el)) {
        routines.push(el);
      }
      else if (noteRoutineLikeTypeGuards.isGroup(el)) {
        routines.push(...el.routines);
      }
      else {
        throw new Error('Invalid RoutineLike Type');
      }
    }
    return routines;
  },

  /**
   * groupName에 해당하는 NoteRoutineGroup을 지정한 open/close 상태로 변경하고 새로운 RoutineNote 객체를 반환한다.
   * @param note
   * @param groupName
   * @param open
   * @returns
   */
  setGroupOpen: (note: RoutineNote, groupName: string, open: boolean): RoutineNote => {
    const newNote = { ...note };
    newNote.routineRoot = newNote.routineRoot.map(routineLike => {
      // Group이면서 이름이 일치한다면 상태를 open으로 변경
      if (noteRoutineLikeTypeGuards.isGroup(routineLike) && routineLike.name === groupName) {
        return { ...routineLike, isOpen: open };
      } else {
        return routineLike;
      }
    });
    return newNote;
  },


}