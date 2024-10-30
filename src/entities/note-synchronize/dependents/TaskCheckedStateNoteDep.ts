/**
 * 노트에 어떤 루틴이 존재하는가는 note-dependents가 아니지만, 해당 루틴에서 파생된 task의 checked 상태는 note-dependents하다. 
 * 때문에 이를 복원할 필요가 있다.
 */

import { RoutineNote } from "entities/note";
import { NoteDependent } from "./NoteDependent";




export class TaskCheckedStateNoteDep extends NoteDependent {
  #checkedTasks: string[] = [];

  constructor(private note: RoutineNote) {
    super();
    this.#checkedTasks = note.tasks.filter(t => t.checked).map(t => t.name);
  }

  restoreData(note: RoutineNote): RoutineNote {
    const newTasks = note.tasks.map(t => {
      if(this.#checkedTasks.includes(t.name)){
        t.checked = true;
      }
      return t;
    })

    return {
      ...note,
      tasks: newTasks,
    }
  }
}