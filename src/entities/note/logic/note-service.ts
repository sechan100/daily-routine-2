import { Day } from "@/shared/period/day";
import { noteInitialContent } from "../config/initial-content";
import { Checkable, CheckableState } from "../model/checkable";
import { RoutineNote } from "../model/note";
import { Task } from "../model/task";
import { NoteRepository, noteRepository } from "../repository/note-repository";
import { RoutineBuilder } from "./RoutineBuilder";
import { routineTreeService } from "./routine-tree-service";


interface NoteService extends NoteRepository {
  // Common
  create: (day: Day) => Promise<RoutineNote>;
  getAllCheckables: (note: RoutineNote) => Checkable[];

  // Tasks
  findTask: (note: RoutineNote, name: string) => Task | null;
  removeTask: (note: RoutineNote, name: string) => RoutineNote;
  checkTask: (note: RoutineNote, taskName: string, state: CheckableState) => Promise<RoutineNote>;
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
    return [...routineTreeService.getAllRoutines(note.routienTree), ...note.tasks];
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
  }
};
