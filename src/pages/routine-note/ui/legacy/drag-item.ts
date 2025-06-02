import { NoteRoutineGroup, NoteRoutineLike, Task } from "@/entities/note";

export type DragItemType = "task" | "routine" | "group";

export type DragItem = {
  type: "task";
  task: Task;
} | {
  type: "routine";
  routine: NoteRoutineLike;
} | {
  type: "group";
  group: NoteRoutineGroup;
}

export const isDragItemType = (type: string): type is DragItemType => {
  return type === "task" || type === "routine" || type === "group";
}