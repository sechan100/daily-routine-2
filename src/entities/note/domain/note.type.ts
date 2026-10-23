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
  // 그룹 heading과 첫 task 사이에 사용자가 직접 쓴 줄들. Task.body와 같은 규칙으로 보존한다.
  body?: string[];
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
  // task 라인 아래에 사용자가 직접 쓴 줄들(하위 항목, 메모 등). 플러그인은 해석하지 않고 그대로 보존한다.
  // undefined면 저장할 때 파일에 있던 같은 이름 task의 body를 유지하고, 빈 배열이면 body를 지운다.
  body?: string[];
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