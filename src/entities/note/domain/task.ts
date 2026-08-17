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
const validateTodoName = (name: string): Result<string, string> => {
  if(name.trim() === ''){
    return err('name cannot be empty');
  }
  if(name.includes('%%')){
    return err(`name cannot contain '%%'`);
  }
  if(name.includes('[[') || name.includes(']]')){
    return err(`name cannot contain '[[' or ']]'`);
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

const createTodoTask = (name: string): TodoTask => ({
  elementType: "task",
  name,
  taskType: "todo",
  state: "un-checked",
  showOnCalendar: true,
  tags: [],
})

// task를 우선으로 제거하고, 없다면 같은 이름의 그룹을 제거한다. (reorder에서 group 제거에도 사용됨)
const removeTask = (note: RoutineNote, name: string): RoutineNote => {
  if(NoteEntity.findTask(note, name)){
    const parent = NoteEntity.findParent(note, name, 'task');
    parent.children = parent.children.filter(t => !(isTask(t) && t.name === name));
  } else {
    NoteEntity.findParent(note, name, 'group'); // 존재하지 않으면 throw
    note.children = note.children.filter(el => !(isTaskGroup(el) && el.name === name));
  }
  return { ...note };
}

const updateTask = (note: RoutineNote, originalName: string, task: RoutineTask | TodoTask): RoutineNote => {
  note = { ...note };
  const parent = NoteEntity.findParent(note, originalName, 'task');
  const idx = parent.children.findIndex(t => isTask(t) && t.name === originalName);
  if(idx !== -1) parent.children[idx] = task;
  return note;
}


export const TaskEntity = {
  validateTaskName,
  validateTodoName,
  createRoutineTask,
  createTodoTask,
  removeTask,
  updateTask,
}