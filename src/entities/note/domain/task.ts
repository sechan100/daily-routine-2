import { err, ok, Result } from "neverthrow";
import { validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { Routine } from "@entities/routine";
import { RoutineTask, TodoTask } from "./note.type";





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
  checked: false,
  showOnCalendar: routine.properties.showOnCalendar,
})

const createTodoTask = (name: string): TodoTask => ({
  elementType: "task",
  name,
  taskType: "todo",
  checked: false,
  showOnCalendar: true,
})


export const TaskEntity = {
  validateTaskName,
  createRoutineTask,
  createTodoTask
}