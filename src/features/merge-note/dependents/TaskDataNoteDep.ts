/**
 * 노트에 어떤 루틴이 존재하는가는 루틴이 정하지만, 그 task의 체크 상태와 task 아래에 적어둔 본문(body)은 노트에 속한 데이터다.
 * 때문에 노트를 다시 만들 때 같은 task(이름과 종류가 같은 task)에 이를 복원할 필요가 있다.
 */

import { isTask, isTaskGroup, NoteEntity, RoutineNote, Task } from "@entities/note";
import { NoteDependent } from "./NoteDependent";


type TaskData = Pick<Task, "state" | "body">;

// 오래된 노트에는 같은 이름의 todo와 루틴이 함께 있을 수 있으므로, 종류까지 같아야 같은 task로 본다.
const keyOf = (task: Task) => `${task.taskType}:${task.name}`;

const withData = (task: Task, data: TaskData): Task => {
  const restored: Task = { ...task, state: data.state };
  if(data.body) restored.body = data.body;
  else delete restored.body;
  return restored;
}

export class TaskDataNoteDep extends NoteDependent {
  #dataByTask = new Map<string, TaskData>();

  constructor(note: RoutineNote) {
    super();
    for(const task of NoteEntity.flatten(note)){
      const key = keyOf(task);
      if(!this.#dataByTask.has(key)) this.#dataByTask.set(key, { state: task.state, body: task.body });
    }
  }

  restoreData(note: RoutineNote): RoutineNote {
    const restore = (task: Task): Task => {
      const data = this.#dataByTask.get(keyOf(task));
      return data ? withData(task, data) : task;
    }
    return {
      ...note,
      children: note.children.map(el => {
        if(isTaskGroup(el)) return { ...el, children: el.children.map(restore) };
        if(isTask(el)) return restore(el);
        return el;
      }),
    };
  }
}
