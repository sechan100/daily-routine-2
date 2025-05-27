import { validateObsidianFileTitle } from "@/shared/utils/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";
import { Checkable } from "./checkable";
import { RoutineNote } from "./note";

export type TaskPropertiesArray = [
  boolean // showOnCalendar
]

export type TaskProperties = {
  showOnCalendar: boolean;
}

export type Task = Checkable & {
  name: string;
  properties: TaskProperties;
}


interface TaskService {
  validateTaskName: (name0: string, taskNames: string) => Result<string, string>;
  createTask: (name: string, showOnCalendar: boolean) => Task;
  removeTask: (note: RoutineNote, name: string) => RoutineNote;
  updateTask: (note: RoutineNote, originalName: string, task: Task) => RoutineNote;
}
export const taskService: TaskService = {
  validateTaskName: (name0: string, taskNames: string): Result<string, string> => {
    return validateObsidianFileTitle(name0)
      .andThen(name1 => {
        return taskNames.includes(name1) ? err('duplicated') : ok(name1);
      });
  },

  createTask: (name: string, showOnCalendar: boolean): Task => ({
    name,
    state: "un-checked",
    properties: {
      showOnCalendar
    }
  }),

  removeTask: (note: RoutineNote, name: string): RoutineNote => {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.filter(task => task.name !== name);
    return newNote;
  },

  updateTask: (note: RoutineNote, originalName: string, task: Task): RoutineNote => {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.map(t => {
      if (t.name === originalName) {
        return task;
      } else {
        return t;
      }
    });
    return newNote;
  }
}