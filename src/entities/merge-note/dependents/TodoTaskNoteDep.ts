import { isTaskGroup, isTodoTask, NoteElement, NoteService, RoutineNote, TaskGroup, TaskParent, TodoTask } from "@/entities/note";
import { RoutineGroupEntity } from "@/entities/routine-like";
import { NoteDependent } from "./NoteDependent";


interface SandwitchedTask {
  parentName: string;
  prev: NoteElement | null;
  task: TodoTask;
  next: NoteElement | null;
  originalIndex: number;
}

const extractSandwitch = (todoTask: TodoTask, parent: TaskParent): SandwitchedTask => {
  const index = parent.children.indexOf(todoTask);
  const prev = index > 0 ? parent.children[index - 1] : null;
  const next = parent.children.length !== index + 1 ? parent.children[index + 1] : null;
  const originalIndex = index;
  return {
    parentName: isTaskGroup(parent) ? parent.name : RoutineGroupEntity.UNGROUPED_NAME,
    prev,
    task: todoTask,
    next,
    originalIndex
  }
}

export class TodoTaskNoteDep extends NoteDependent {
  #sandwitches: SandwitchedTask[] = [];

  constructor(note: RoutineNote) {
    super();
    this.#sandwitches = note.children.flatMap(el => {
      if (isTaskGroup(el)) {
        return el.children.filter(isTodoTask).map(task => extractSandwitch(task, el));
      } else if (isTodoTask(el)) {
        return [extractSandwitch(el, note)];
      } else {
        return [];
      }
    })
  }

  /**
    TodoTask 인덱스 복원 알고리즘
    1. 원래 앞뒤로 있던 task들을 찾는다.
    2. 만약 앞뒤 task들이 똑같이 붙어있다면 그 사이에 넣는다(Best)
    3. 만약 둘이 떨어져있다면, 앞 task의 뒤에 넣었을 때의 인덱스와 원래 인덱스의 차이, 그리고 뒤 task의 앞에 넣었을 때와 원래 인덱스의 차이를 구해서 더 작은 쪽을 택한다. 차이가 없다면 대충 둘 중 아무거나에 넣는다. (Good)
    4. 만약 둘 중 하나의 task가 존재하지 않는다면 있는 쪽에 위치시킨다.(Bad)
    5. 만약 둘 다 없다면 맨 앞에 넣는다 (Worst)
   */
  restoreData(note: RoutineNote) {
    for (const { parentName, prev, task, next, originalIndex } of this.#sandwitches) {
      let parent: TaskParent;
      if (parentName !== RoutineGroupEntity.UNGROUPED_NAME) {
        const parentOrNull = NoteService.findGroup(note, parentName);
        // 고아가 된 경우
        if (parentOrNull === null) {
          note.children.unshift(task);
          continue;
        } else {
          parent = parentOrNull as TaskGroup;
        }
      } else {
        parent = note;
      }
      const children = isTaskGroup(parent) ? parent.children : parent.children;
      const prevIndex = prev ? children.findIndex(t => t.name === prev.name) : -1;
      const nextIndex = next ? children.findIndex(t => t.name === next.name) : -1;

      // 앞뒤 다 없음
      if (prevIndex === -1 && nextIndex === -1) {
        children.unshift(task);
      }
      // 앞만 없음
      else if (prevIndex === -1) {
        // 앞이 없어진게 아니라 원래 없었던 경우: 원래 맨 앞이었다는 뜻
        if (prev === null) {
          children.unshift(task);
          continue;
        }
        children.splice(nextIndex, 0, task);
      }
      // 뒤만 없음
      else if (nextIndex === -1) {
        // 뒤가 없어진게 아니라 원래 없었던 경우: 원래 맨 뒤였다는 뜻
        if (next === null) {
          children.push(task);
          continue;
        }
        children.splice(prevIndex + 1, 0, task);
      }
      // 둘 다 있음
      else {
        const prevDiff = Math.abs(prevIndex - originalIndex);
        const nextDiff = Math.abs(nextIndex - originalIndex + 1); // next는 앞에 todo가 삽입되므로 +1
        if (prevDiff < nextDiff) {
          children.splice(prevIndex + 1, 0, task);
        } else {
          children.splice(nextIndex, 0, task);
        }
      }
    }
    return { ...note };
  }
}