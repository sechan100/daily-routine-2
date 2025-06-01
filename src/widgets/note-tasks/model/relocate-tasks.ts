import { Task } from "@/entities/note";
import { DndCase } from "@/shared/dnd/resolve-dnd-case";




type RelocateTasksArgs = {
  overTaskName: string;
  activeTaskName: string;
  dndCase: DndCase;
}
export const relocateTasks = (tasks: Task[], { overTaskName, activeTaskName, dndCase }: RelocateTasksArgs): Task[] => {
  if (dndCase === "insert-into-first" || dndCase === "insert-into-last") {
    throw new Error("Cannot relocate tasks into first or last position");
  }
  const overIndex = tasks.findIndex(task => task.name === overTaskName);
  const activeIndex = tasks.findIndex(task => task.name === activeTaskName);
  if (overIndex === -1 || activeIndex === -1) {
    throw new Error("Task not found");
  }
  const activeTask = tasks[activeIndex];
  const newTasks = [...tasks];
  newTasks.splice(activeIndex, 1);
  switch (dndCase) {
    case "insert-before":
      newTasks.splice(overIndex, 0, activeTask);
      break;
    case "insert-after":
      newTasks.splice(overIndex + 1, 0, activeTask);
      break;
    default:
      throw new Error(`Unsupported dnd case: ${dndCase}`);
  }
  return newTasks;
}