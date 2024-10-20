import { RoutineNote } from "entities/routine-note";
import { NoteDepentdent } from "./note-dependents";





export class TodoTaskNoteDep extends NoteDepentdent {
  #task: string;

  constructor(private note: RoutineNote) {
    super();
    this.#task = note.day.getBaseFormat();
  }

  restoreData(note: RoutineNote): RoutineNote {
    return note;
  }
}