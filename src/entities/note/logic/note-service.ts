import { Day } from "@/shared/period/day";
import { noteInitialContent } from "../config/initial-content";
import { Checkable, CheckableState } from "../model/checkable";
import { RoutineNote } from "../model/note";
import { NoteRoutine, NoteRoutineGroup, NoteRoutineLike, isNoteRoutine, isNoteRoutineGroup } from "../model/note-routine-like";
import { RoutineTree } from "../model/routine-tree";
import { Task } from "../model/task";
import { NoteRepository, noteRepository } from "../repository/note-repository";
import { RoutineBuilder } from "./RoutineBuilder";

const findRoutineLike = (note: RoutineNote, name: string): NoteRoutineLike | null => {
  for (const el of note.routienTree.root) {
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

interface NoteService extends NoteRepository {
  // Common
  create: (day: Day) => Promise<RoutineNote>;
  getAllCheckables: (note: RoutineNote) => Checkable[];

  // Tasks
  findTask: (note: RoutineNote, name: string) => Task | null;
  removeTask: (note: RoutineNote, name: string) => RoutineNote;
  checkTask: (note: RoutineNote, taskName: string, state: CheckableState) => Promise<RoutineNote>;

  // Routines
  findRoutine: (note: RoutineNote, name: string) => NoteRoutine | null;
  findRoutineGroup: (note: RoutineNote, name: string) => NoteRoutineLike | null;
  setGroupOpen: (note: RoutineNote, groupName: string, open: boolean) => RoutineNote;
  checkRoutine: (note: RoutineNote, routineName: string, state: CheckableState) => Promise<RoutineNote>;
  findRoutineParent: (note: RoutineNote, routineName: string) => NoteRoutineGroup | null;
  getAllRoutines: (noteOrTree: RoutineNote | RoutineTree) => NoteRoutine[];
}
export const noteService: NoteService = {
  ...noteRepository,
  // Common
  async create(day: Day): Promise<RoutineNote> {
    const routineBuilder = await RoutineBuilder.withDiskAsync();
    const routienTree = routineBuilder.build(day);
    return {
      day,
      userContent: noteInitialContent,
      tasks: [],
      routienTree,
    };
  },
  getAllCheckables(note: RoutineNote): Checkable[] {
    return [...noteService.getAllRoutines(note), ...note.tasks];
  },

  // Tasks
  findTask: (note: RoutineNote, name: string): Task | null => {
    for (const el of note.tasks) {
      if (el.name === name) {
        return el;
      }
    }
    return null;
  },
  removeTask: (note: RoutineNote, name: string): RoutineNote => {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.filter(task => task.name !== name);
    return newNote;
  },
  checkTask: async (note: RoutineNote, taskName: string, state: CheckableState): Promise<RoutineNote> => {
    const newNote = { ...note };
    const task = noteService.findTask(newNote, taskName);
    if (!task) throw new Error("Check state change target task not found");

    task.state = state;
    await noteService.saveOnUserConfirm(newNote);
    return newNote;
  },

  // Routines
  findRoutine: (note: RoutineNote, name: string): NoteRoutine | null => {
    const routineLike = findRoutineLike(note, name);
    if (isNoteRoutine(routineLike)) {
      return routineLike;
    }
    return null;
  },
  findRoutineGroup: (note: RoutineNote, name: string): NoteRoutineLike | null => {
    const routineLike = findRoutineLike(note, name);
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
  setGroupOpen: (note: RoutineNote, groupName: string, open: boolean): RoutineNote => {
    const newNote = { ...note };
    newNote.routienTree.root = newNote.routienTree.root.map(routineLike => {
      // Group이면서 이름이 일치한다면 상태를 open으로 변경
      if (isNoteRoutineGroup(routineLike) && routineLike.name === groupName) {
        return { ...routineLike, isOpen: open };
      } else {
        return routineLike;
      }
    });
    return newNote;
  },
  checkRoutine: async (note: RoutineNote, routineName: string, state: CheckableState): Promise<RoutineNote> => {
    const newNote = { ...note };
    const routine = noteService.findRoutine(newNote, routineName);
    if (!routine) throw new Error("Check state change target routine not found");

    routine.state = state;
    await noteService.saveOnUserConfirm(newNote);
    return newNote;
  },
  /**
   * routineName에 해당하는 routine의 부모 RoutineGroup을 찾아 반환한다.
   * null을 반환하는 경우는 Group이 없는 경우이다.
   * @param note
   * @param routineName
   */
  findRoutineParent: (note: RoutineNote, routineName: string): NoteRoutineGroup | null => {
    for (const el of note.routienTree.root) {
      if (isNoteRoutineGroup(el)) {
        const found = el.routines.find(r => r.name === routineName);
        if (found) {
          return el;
        }
      }
    }
    return null;
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

};
