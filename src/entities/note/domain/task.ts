import { err, ok, Result } from "neverthrow";
import { validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";
import { Routine } from "@entities/routine";
import { isTask, isTaskGroup, RoutineNote, RoutineTask, Task, TodoTask } from "./note.type";
import { NoteEntity } from "./note";





const validateTaskName = (name0: string, taskNames: string): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    return taskNames.includes(name1) ? err('duplicated') : ok(name1);
  });
}

// todo 이름이 노트의 task 라인 형식을 깨뜨리지 않는지 검증한다.
// 노트 안의 task는 이름으로 식별되므로, 같은 노트에 이미 있는 이름(existingNames)은 쓸 수 없다.
// 에러 코드: 'empty' | 'duplicated' | 'contains-comment-marker' | 'contains-link-brackets'
const validateTodoName = (name: string, existingNames: string[] = []): Result<string, string> => {
  if(name.trim() === ''){
    return err('empty');
  }
  if(existingNames.some(n => n.trim() === name.trim())){
    return err('duplicated');
  }
  if(name.includes('%%')){
    return err('contains-comment-marker');
  }
  if(name.includes('[[') || name.includes(']]')){
    return err('contains-link-brackets');
  }
  return ok(name);
}

const createRoutineTask = (routine: Routine): RoutineTask => ({
  elementType: "task",
  name: routine.name,
  taskType: "routine",
  state: "un-checked",
  showOnCalendar: routine.properties.showOnCalendar,
  tags: routine.properties.tags ?? [],
})

const createTodoTask = (name: string, showOnCalendar: boolean): TodoTask => ({
  elementType: "task",
  name,
  taskType: "todo",
  state: "un-checked",
  showOnCalendar,
  tags: [],
})

// task를 우선으로 제거하고, 없다면 같은 이름의 그룹을 제거한다. (reorder에서 group 제거에도 사용됨)
// 저장에 실패해도 화면의 노트가 바뀌지 않도록, 전달받은 노트는 수정하지 않고 새 노트를 반환한다.
const removeTask = (note: RoutineNote, name: string): RoutineNote => {
  if(NoteEntity.findTask(note, name)){
    const parent = NoteEntity.findParent(note, name, 'task');
    const children = note.children.flatMap(el => {
      if(isTask(el)) return el.name === name ? [] : [el];
      if(isTaskGroup(el) && el === parent) return [{ ...el, children: el.children.filter(t => t.name !== name) }];
      return [el];
    });
    return { ...note, children };
  } else {
    NoteEntity.findParent(note, name, 'group'); // 존재하지 않으면 throw
    return { ...note, children: note.children.filter(el => !(isTaskGroup(el) && el.name === name)) };
  }
}

// 전달받은 노트는 수정하지 않고 새 노트를 반환한다.
const updateTask = (note: RoutineNote, originalName: string, task: RoutineTask | TodoTask): RoutineNote => {
  const parent = NoteEntity.findParent(note, originalName, 'task');
  const replace = (t: Task): Task => t.name === originalName ? task : t;
  const children = note.children.map(el => {
    if(isTask(el) && parent === note) return replace(el);
    if(isTaskGroup(el) && el === parent) return { ...el, children: el.children.map(replace) };
    return el;
  });
  return { ...note, children };
}


export const TaskEntity = {
  validateTaskName,
  validateTodoName,
  createRoutineTask,
  createTodoTask,
  removeTask,
  updateTask,
}