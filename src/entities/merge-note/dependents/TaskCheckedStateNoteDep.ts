/**
 * 노트에 어떤 루틴이 존재하는가는 note-dependents가 아니지만, 해당 루틴에서 파생된 task의 checked 상태는 note-dependents하다. 
 * 때문에 이를 복원할 필요가 있다.
 */

import { NoteService, RoutineNote, TaskState } from "@/entities/note";
import { NoteDependent } from "./NoteDependent";




export class TaskCheckedStateNoteDep extends NoteDependent {
  #checkedTasks: [string, TaskState][] = [];

  constructor(note: RoutineNote) {
    super();
    this.#checkedTasks = NoteService.flatten(note)
      .filter(t => t.state !== 'un-checked')
      .map(t => [t.name, t.state]);
  }

  restoreData(note: RoutineNote) {
    for (const task of NoteService.flatten(note)) {
      let originalTaskIndex: number;
      if ((originalTaskIndex = this.#checkedTasks.findIndex(([name]) => name === task.name)) !== -1) {
        const [_, state] = this.#checkedTasks[originalTaskIndex];
        task.state = state;
      }
    }
    return { ...note };
  }
}