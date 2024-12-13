/**
 * 노트에 어떤 루틴이 존재하는가는 note-dependents가 아니지만, 해당 루틴에서 파생된 task의 checked 상태는 note-dependents하다. 
 * 때문에 이를 복원할 필요가 있다.
 */

import { RoutineNote } from "@entities/note";
import { NoteDependent } from "./NoteDependent";




export class TaskCheckedStateNoteDep extends NoteDependent {
  #checkedTasks: string[] = [];

  constructor(note: RoutineNote) {
    super();
    this.#checkedTasks = note.createTaskArray()
    .filter(t => t.isChecked())
    .map(t => t.getName());
  }

  restoreData(note: RoutineNote) {
    for(const task of note.createTaskArray()){
      if(this.#checkedTasks.includes(task.getName())){
        task.check();
      }
    }
  }
}