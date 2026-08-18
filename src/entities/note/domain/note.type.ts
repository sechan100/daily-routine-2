import { Day } from "@shared/period/day";


export type RoutineNote = {
  day: Day;
  children: NoteElement[];
}
export const isRoutineNote = (routineNote: unknown): routineNote is RoutineNote => {
  const candidate = routineNote as RoutineNote;
  const hasDay = candidate.day instanceof Day;
  const hasRoot = Array.isArray(candidate.children);
  return hasDay && hasRoot;
}

export type NoteElement = {
  elementType: "group" | "task";
  name: string;
}
export const isNoteElement = (noteElement: unknown): noteElement is NoteElement => {
  const candidate = noteElement as NoteElement;
  const hasName = typeof candidate.name === "string";
  const hasType = candidate.elementType === "group" || candidate.elementType === "task";
  return hasName && hasType;
}

export type TaskGroup = NoteElement & {
  elementType: "group";
  children: Task[];
  isOpen: boolean;
}
export const isTaskGroup = (taskGroup: unknown): taskGroup is TaskGroup => {
  const candidate = taskGroup as TaskGroup;
  const elementType = candidate.elementType === "group";
  const hasTasks = Array.isArray(candidate.children);
  return elementType && hasTasks;
}

export type TaskParent = RoutineNote | TaskGroup;

export type TaskType = "routine" | "todo";
export type TaskState = "un-checked" | "accomplished" | "failed";
export type Task = NoteElement & {
  elementType: "task";
  taskType: TaskType;
  state: TaskState;
  showOnCalendar: boolean;
  tags: string[];
}
export const isTask = (task: unknown): task is Task => {
  const candidate = task as Task;
  const elementType = candidate.elementType === "task";
  const hasTaskType = candidate.taskType === "routine" || candidate.taskType === "todo";
  const hasState = candidate.state === "un-checked" || candidate.state === "accomplished" || candidate.state === "failed";
  const hasShowOnCalendar = typeof candidate.showOnCalendar === "boolean";
  return elementType && hasTaskType && hasState && hasShowOnCalendar;
}

export type RoutineTask = Task & {
  taskType: "routine";
}
export const isRoutineTask = (routineTask: unknown): routineTask is RoutineTask => {
  return isTask(routineTask) && routineTask.taskType == "routine";
}

export type TodoTask = Task & {
  taskType: "todo";
}
export const isTodoTask = (todoTask: unknown): todoTask is TodoTask => {
  return isTask(todoTask) && todoTask.taskType === "todo";
}

export type TaskMetaData = {
  type: TaskType;
  soc: boolean; // showOnCalendar
  tags?: string[]; // 구버전 라인과의 호환을 위해, 비어있는 경우 직렬화하지 않는다.
}

export type NotePerformance = {
  totalTasks: number;
  completedTasks: number;
  uncompletedTasks: number;
  completion: number;
  accomplishedTasks: number;
  accomplishment: number;
}