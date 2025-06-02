import { Task } from "@/entities/note";
import { DndCase } from "@/shared/dnd/resolve-dnd-case";




type RelocateTasksArgs = {
  overTaskName: string;
  activeTaskName: string;
  dndCase: DndCase;
}
export const relocateTasks = (tasks: Task[], { overTaskName, activeTaskName, dndCase }: RelocateTasksArgs): Task[] => {
  // Task를 재배치한 새로운 task 배열을 구성.
  if (dndCase === "insert-into-first" || dndCase === "insert-into-last") {
    throw new Error("Cannot relocate tasks into first or last position");
  }
  const newTasks = [...tasks];
  const _activeIndex = newTasks.findIndex(task => task.name === activeTaskName);
  if (_activeIndex === -1) {
    throw new Error("Active task not found");
  }
  const activeTask = newTasks[_activeIndex];
  newTasks.splice(_activeIndex, 1);
  const overIndex = newTasks.findIndex(task => task.name === overTaskName);
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

  // newTasks를 note 데이터에 반영


  return newTasks;
}