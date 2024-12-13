import { RoutineNote, AbstractTask, TodoTask, TaskGroup } from "@entities/note";
import { NoteDependent } from "./NoteDependent";
import { RoutineGroup } from "@entities/routine";


interface SandwitchedTask {
  group: string;
  prev: AbstractTask | null;
  task: TodoTask;
  next: AbstractTask | null;
  originalIndex: number;
}


export class TodoTaskNoteDep extends NoteDependent {
  #sandwitches: SandwitchedTask[] = [];

  constructor(note: RoutineNote){
    super();
    const tasks: TodoTask[] = note.createTaskArray().filter(t => t instanceof TodoTask)
    this.#sandwitches = tasks.map((task, i) => {
      const group = (() => {
        const p = task.getParent();
        if(p === null) throw new Error('todo task must have parent');
        if(p instanceof RoutineNote) return RoutineGroup.UNGROUPED_NAME;
        else if(p instanceof RoutineGroup) return p.getName();
        else throw new Error('invalid parent type');
      })();
      const prev = i > 0 ? tasks[i - 1] : null;
      const next = tasks.length !== i + 1 ? tasks[i + 1] : null;
      const originalIndex = i;
      return { group, prev, task, next, originalIndex }
    });
  }

  /**
    TodoTask 인덱스 복원 알고리즘
    1. 원래 앞뒤로 있던 루틴들을 찾는다.
    2. 만약 앞뒤 루틴이 똑같이 붙어있다면 그 사이에 넣는다(Best)
    3. 만약 둘이 떨어져있다면, 앞 루틴의 뒤에 넣었을 때의 인덱스와 원래 인덱스의 차이, 그리고 뒤 루틴의 앞에 넣었을 때와 원래 인덱스의 차이를 구해서 더 작은 쪽을 택한다. 차이가 없다면 대충 둘 중 아무거나에 넣는다. (Good)
    4. 만약 둘 중 하나의 루틴이 없다면 있는 쪽에 위치시킨다.(Bad)
    5. 만약 둘 다 없다면 맨 앞에 넣는다 (Worst)
   */
  restoreData(note: RoutineNote) {
    for(const { group: groupName, prev, task, next, originalIndex } of this.#sandwitches){
      const groupOrNull = note.findGroup(groupName);
      // 고아가됐다면, 맨 위에 넣는다.
      if(groupOrNull === null){
        note.addEl(task);
      }
      const group = groupOrNull as TaskGroup;
      const tasks = group.getTasks();
      const prevIndex = prev ? tasks.findIndex(t => t.getName() === prev.getName()) : -1;
      const nextIndex = next ? tasks.findIndex(t => t.getName() === next.getName()) : -1;

      // 앞뒤 다 없음
      if (prevIndex === -1 && nextIndex === -1) {
        tasks.unshift(task);
      }
      // 앞만 없음
      else if (prevIndex === -1) {
        // 앞이 없어진게 아니라 원래 없었던 경우: 원래 맨 앞이었다는 뜻
        if(prev === null) {
          tasks.unshift(task);
          return;
        }
        tasks.splice(nextIndex, 0, task);
      } 
      // 뒤만 없음
      else if (nextIndex === -1) {
        // 뒤가 없어진게 아니라 원래 없었던 경우: 원래 맨 뒤였다는 뜻
        if(next === null) {
          tasks.push(task);
          return;
        }
        tasks.splice(prevIndex + 1, 0, task);
      } 
      // 둘 다 있음
      else {
        const prevDiff = Math.abs(prevIndex - originalIndex);
        const nextDiff = Math.abs(nextIndex - originalIndex + 1); // next는 앞에 todo가 삽입되므로 +1
        if (prevDiff < nextDiff) {
          tasks.splice(prevIndex + 1, 0, task);
        } else {
          tasks.splice(nextIndex, 0, task);
        }
      }
    }
  }
}