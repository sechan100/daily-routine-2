/**
 * 그룹을 접어두었는지와 그룹 heading 아래에 적어둔 본문(body)은 노트마다 다른 데이터다.
 * 루틴으로부터 만든 그룹은 항상 펼쳐져 있고 본문이 없으므로, 원래 노트의 같은 그룹의 값을 복원한다.
 */

import { isTaskGroup, RoutineNote, TaskGroup } from "@entities/note";
import { NoteDependent } from "./NoteDependent";


type GroupData = Pick<TaskGroup, "isOpen" | "body">;

export class GroupDataNoteDep extends NoteDependent {
  #dataByName = new Map<string, GroupData>();

  constructor(note: RoutineNote) {
    super();
    for(const el of note.children){
      if(isTaskGroup(el) && !this.#dataByName.has(el.name)) this.#dataByName.set(el.name, { isOpen: el.isOpen, body: el.body });
    }
  }

  restoreData(note: RoutineNote): RoutineNote {
    return {
      ...note,
      children: note.children.map(el => {
        if(!isTaskGroup(el)) return el;
        const data = this.#dataByName.get(el.name);
        if(!data) return el;
        const restored: TaskGroup = { ...el, isOpen: data.isOpen };
        if(data.body) restored.body = data.body;
        return restored;
      }),
    };
  }
}
