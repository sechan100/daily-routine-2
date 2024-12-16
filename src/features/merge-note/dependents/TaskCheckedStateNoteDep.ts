/**
 * 노트에 어떤 루틴이 존재하는가는 note-dependents가 아니지만, 해당 루틴에서 파생된 task의 checked 상태는 note-dependents하다. 
 * 때문에 이를 복원할 필요가 있다.
 */

import { RoutineNote } from "@entities/note";
import { NoteDependent } from "./NoteDependent";
import { NoteEntity } from "@entities/note/domain/note";




export class TaskCheckedStateNoteDep extends NoteDependent {
  #checkedTasks: string[] = [];

  constructor(note: RoutineNote) {
    super();
    this.#checkedTasks = NoteEntity.flatten(note)
    .filter(t => t.checked)
    .map(t => t.name);
  }

  restoreData(note: RoutineNote) {
    for(const task of NoteEntity.flatten(note)){
      if(this.#checkedTasks.includes(task.name)){
        task.checked = true;
      }
    }
  }
}