import { NoteElement } from "@entities/note";

export interface TaskElDragItem {
  el: NoteElement;
}

export type TaskElDragItemType = "TASK" | "GROUP";
export const isTaskElDragItemType = (type: string): type is TaskElDragItemType => {
  return type === "TASK" || type === "GROUP";
}