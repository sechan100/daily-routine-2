/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day } from "@shared/period/day";


export type RoutineNote = {
  day: Day;
  children: NoteElement[];
}
export const isRoutineNote = (routineNote: any): routineNote is RoutineNote => {
  const hasDay = routineNote.day instanceof Day;
  const hasRoot = Array.isArray(routineNote.children);
  return hasDay && hasRoot;
}

export type NoteElement = {
  elementType: "group" | "task";
  name: string;
}
export const isNoteElement = (noteElement: any): noteElement is NoteElement => {
  const hasName = typeof noteElement.name === "string";
  const hasType = noteElement.elementType === "group" || noteElement.elementType === "task";
  return hasName && hasType;
}

export type TaskGroup = NoteElement & {
  elementType: "group";
  children: Task[];
  isOpen: boolean;
}
export const isTaskGroup = (taskGroup: any): taskGroup is TaskGroup => {
  const elementType = taskGroup.elementType === "group";
  const hasTasks = Array.isArray(taskGroup.children);
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
}
export const isTask = (task: any): task is Task => {
  const elementType = task.elementType === "task";
  const hasTaskType = task.taskType === "routine" || task.taskType === "todo";
  const hasState = task.state === "un-checked" || task.state === "accomplished" || task.state === "failed";
  const hasShowOnCalendar = typeof task.showOnCalendar === "boolean";
  return elementType && hasTaskType && hasState && hasShowOnCalendar;
}

export type RoutineTask = Task & {
  taskType: "routine";
}
export const isRoutineTask = (routineTask: any): routineTask is RoutineTask => {
  return isTask(routineTask) && routineTask.taskType == "routine";
}

export type TodoTask = Task & {
  taskType: "todo";
}
export const isTodoTask = (todoTask: any): todoTask is TodoTask => {
  return isTask(todoTask) && todoTask.taskType === "todo";
}

export type TaskMetaData = {
  type: TaskType;
  soc: boolean; // showOnCalendar
}

export type NotePerformance = {
  totalTasks: number;
  completedTasks: number;
  uncompletedTasks: number;
  completion: number;
  accomplishedTasks: number;
  accomplishment: number;
}