import { Task } from "@/entities/note";
import { DndCase } from "@/shared/dnd/dnd-case";
import { CollisionContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { BaseDndItem } from "@/shared/dnd/drag-item";

export const taskCollisionResolver = ({ active, over, collisionType }: CollisionContext<BaseDndItem>): DndCase | null => {
  if (active.id === over.id) return null;
  switch (collisionType) {
    case "above":
      return "insert-before";
    case "below":
      return "insert-after";
    case "center":
      return null;
  }
}

export const reorderTasks = (tasks: Task[], { active, over, dndCase }: OnDragEndContext<BaseDndItem>): Task[] => {
  // Task를 재배치한 새로운 task 배열을 구성.
  if (dndCase === "insert-into-first" || dndCase === "insert-into-last") {
    throw new Error("Cannot relocate tasks into first or last position");
  }
  const newTasks = [...tasks];
  const _activeIndex = newTasks.findIndex(task => task.name === active.id);
  if (_activeIndex === -1) {
    throw new Error("Active task not found");
  }
  const activeTask = newTasks[_activeIndex];
  newTasks.splice(_activeIndex, 1);
  const overIndex = newTasks.findIndex(task => task.name === over.id);
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