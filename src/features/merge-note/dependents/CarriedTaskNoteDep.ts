/**
 * 루틴으로부터 다시 만들어지지 않지만 노트에 남아야 하는 요소들을, 원래 있던 자리에 최대한 가깝게 되돌려놓는다.
 * - todo: 사용자가 노트에 직접 추가한 task.
 * - 기록이 남은 루틴 task: 루틴이 삭제·비활성화되거나 일정이 바뀌어 더는 만들어지지 않지만, 이미 체크(또는 실패 처리)했거나 본문을 적어둔 task.
 *   그날 한 일의 기록이므로 오늘과 과거 노트에서는 지우지 않는다. 미래 노트는 루틴을 따른다.
 * - 루틴 그룹이 아닌 그룹: 사용자가 직접 쓴 '## 메모' 같은 그룹이나 삭제된 그룹. 본문이 있거나 위의 task가 남아있을 때만 남기고, 비었으면 지운다.
 */

import { isTask, isTaskGroup, isTodoTask, NoteElement, NoteEntity, RoutineNote, Task, TaskGroup, TaskParent } from "@entities/note";
import { RoutineGroupEntity } from "@entities/routine";
import { NoteDependent } from "./NoteDependent";


type SandwichedElement = {
  parentName: string;
  prev: NoteElement | null;
  el: Task | TaskGroup;
  next: NoteElement | null;
  originalIndex: number;
}

const extractSandwich = (el: Task | TaskGroup, parent: TaskParent): SandwichedElement => {
  const children: NoteElement[] = parent.children;
  const index = children.indexOf(el);
  return {
    parentName: isTaskGroup(parent) ? parent.name : RoutineGroupEntity.UNGROUPED_NAME,
    prev: index > 0 ? children[index - 1] : null,
    el,
    next: index + 1 < children.length ? children[index + 1] : null,
    originalIndex: index,
  }
}

const hasBody = (el: Task | TaskGroup) => (el.body?.length ?? 0) > 0;
const hasRecord = (task: Task) => task.state !== "un-checked" || hasBody(task);

// task와 group이 같은 이름을 가질 수 있으므로 종류까지 비교한다.
const indexOf = (children: NoteElement[], el: NoteElement | null) => {
  return el ? children.findIndex(c => c.name === el.name && c.elementType === el.elementType) : -1;
}

/**
  인덱스 복원 알고리즘
  1. 원래 앞뒤로 있던 요소들을 찾는다.
  2. 만약 앞뒤 요소가 똑같이 붙어있다면 그 사이에 넣는다(Best)
  3. 만약 둘이 떨어져있다면, 앞 요소의 뒤에 넣었을 때의 인덱스와 원래 인덱스의 차이, 그리고 뒤 요소의 앞에 넣었을 때와 원래 인덱스의 차이를 구해서 더 작은 쪽을 택한다. 차이가 없다면 대충 둘 중 아무거나에 넣는다. (Good)
  4. 만약 둘 중 하나의 요소가 없다면 있는 쪽에 위치시킨다.(Bad)
  5. 만약 둘 다 없다면 맨 앞에 넣는다 (Worst)
  원래 순서대로 복원하므로, 앞 요소가 함께 복원되는 요소라도 이미 자리를 잡은 뒤다.
 */
const insert = (note: RoutineNote, { parentName, prev, el, next, originalIndex }: SandwichedElement) => {
  let parent: TaskParent = note;
  if(parentName !== RoutineGroupEntity.UNGROUPED_NAME){
    const group = NoteEntity.findGroup(note, parentName);
    // 고아가 된 경우
    if(group === null){
      note.children.unshift(el);
      return;
    }
    parent = group;
  }
  const children: NoteElement[] = parent.children;
  const prevIndex = indexOf(children, prev);
  const nextIndex = indexOf(children, next);

  // 앞뒤 다 없음
  if(prevIndex === -1 && nextIndex === -1) {
    children.unshift(el);
  }
  // 앞만 없음
  else if (prevIndex === -1) {
    // 앞이 없어진게 아니라 원래 없었던 경우: 원래 맨 앞이었다는 뜻
    if(prev === null) children.unshift(el);
    else children.splice(nextIndex, 0, el);
  }
  // 뒤만 없음
  else if (nextIndex === -1) {
    // 뒤가 없어진게 아니라 원래 없었던 경우: 원래 맨 뒤였다는 뜻
    if(next === null) children.push(el);
    else children.splice(prevIndex + 1, 0, el);
  }
  // 둘 다 있음
  else {
    const prevDiff = Math.abs(prevIndex - originalIndex);
    const nextDiff = Math.abs(nextIndex - originalIndex + 1); // next는 앞에 요소가 삽입되므로 +1
    if (prevDiff < nextDiff) {
      children.splice(prevIndex + 1, 0, el);
    } else {
      children.splice(nextIndex, 0, el);
    }
  }
}

export class CarriedTaskNoteDep extends NoteDependent {
  // 원래 노트의 순서대로. 그룹은 그 그룹 안의 task들보다 앞에 온다.
  #candidates: SandwichedElement[] = [];

  /**
   * @param keepRoutineRecords 기록이 남은 루틴 task를 남길지 여부(오늘과 과거 노트).
   */
  constructor(note: RoutineNote, keepRoutineRecords: boolean){
    super();
    const shouldCarry = (task: Task) => isTodoTask(task) || (keepRoutineRecords && hasRecord(task));
    for(const el of note.children){
      if(isTaskGroup(el)){
        this.#candidates.push(extractSandwich(el, note));
        for(const task of el.children){
          if(shouldCarry(task)) this.#candidates.push(extractSandwich(task, el));
        }
      } else if(isTask(el) && shouldCarry(el)){
        this.#candidates.push(extractSandwich(el, note));
      }
    }
  }

  restoreData(note: RoutineNote): RoutineNote {
    const tasks = this.#candidates.filter(c => isTask(c.el));
    // 노트 안의 task는 이름으로 식별되므로, todo와 같은 이름의 루틴은 이 노트에서 빼고 사용자가 만든 todo를 남긴다.
    const todoNames = new Set(tasks.filter(c => isTodoTask(c.el)).map(c => c.el.name));
    // 루틴으로부터 다시 만들어진 루틴 task와 그룹은 새 자리를 따른다(데이터는 TaskDataNoteDep, GroupDataNoteDep이 복원한다).
    const recreatedTaskNames = new Set(NoteEntity.flatten(note).map(t => t.name));
    const recreatedGroupNames = new Set(note.children.filter(isTaskGroup).map(g => g.name));
    const carriedTasks = tasks.filter(({ el }) => isTodoTask(el) || (!recreatedTaskNames.has(el.name) && !todoNames.has(el.name)));
    const isCarriedGroup = (group: TaskGroup) => {
      return !recreatedGroupNames.has(group.name) && (hasBody(group) || carriedTasks.some(c => c.parentName === group.name));
    }

    // 배열을 복사해서 끼워넣으므로 매개받은 note는 바뀌지 않는다.
    const result: RoutineNote = {
      ...note,
      children: note.children
      .filter(el => !(isTask(el) && todoNames.has(el.name)))
      .map(el => isTaskGroup(el) ? { ...el, children: el.children.filter(t => !todoNames.has(t.name)) } : el),
    };
    for(const candidate of this.#candidates){
      const { el } = candidate;
      if(isTaskGroup(el)){
        // 같은 이름의 그룹이 둘 있던 노트라면 하나로 합친다.
        if(isCarriedGroup(el) && NoteEntity.findGroup(result, el.name) === null){
          insert(result, { ...candidate, el: { ...el, children: [] } });
        }
      } else if(carriedTasks.includes(candidate)){
        insert(result, { ...candidate, el: { ...el } });
      }
    }
    return result;
  }
}
