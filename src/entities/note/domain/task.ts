import { err, ok, Result } from "neverthrow";
import { validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { Routine } from "@entities/routine";
import { RoutineNote, RoutineTask, Task, TodoTask } from "./note.type";
import { NoteEntity } from "./note";





const validateTaskName = (name0: string, taskNames: string): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    return taskNames.includes(name1) ? err('duplicated') : ok(name1);
  });
}

const createRoutineTask = (routine: Routine): RoutineTask => ({
  elementType: "task",
  name: routine.name,
  taskType: "routine",
  state: "un-checked",
  showOnCalendar: routine.properties.showOnCalendar,
})

const createTodoTask = (name: string): TodoTask => ({
  elementType: "task",
  name,
  taskType: "todo",
  state: "un-checked",
  showOnCalendar: true,
})

const removeTask = (note: RoutineNote, name: string): RoutineNote => {
  const parent = NoteEntity.findParent(note, name);
  parent.children = parent.children.filter(t => t.name !== name);
  return { ...note };
}

const updateTask = (note: RoutineNote, originalName: string, task: RoutineTask | TodoTask): RoutineNote => {
  note = { ...note };
  const parent = NoteEntity.findParent(note, originalName);
  const idx = parent.children.findIndex(t => t.name === originalName);
  parent.children[idx] = task;
  return note;
}


export const TaskEntity = {
  validateTaskName,
  createRoutineTask,
  createTodoTask,
  removeTask,
  updateTask,
}