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

export type TaskGroup = NoteElement & {
  elementType: "group";
  children: Task[];
}
export const isTaskGroup = (taskGroup: any): taskGroup is TaskGroup => {
  const elementType = taskGroup.elementType === "group";
  const hasTasks = Array.isArray(taskGroup.children);
  return elementType && hasTasks;
}

export type TaskParent = RoutineNote | TaskGroup;

export type TaskType = "routine" | "todo";

export type Task = NoteElement & {
  elementType: "task";
  taskType: TaskType;
  checked: boolean;
  showOnCalendar: boolean;
}
export const isTask = (task: any): task is Task => {
  const elementType = task.elementType === "task";
  const hasTaskType = task.taskType === "routine" || task.taskType === "todo";
  const hasChecked = typeof task.checked === "boolean";
  const hasShowOnCalendar = typeof task.showOnCalendar === "boolean";
  return elementType && hasTaskType && hasChecked && hasShowOnCalendar;
}

export type RoutineTask = Task & {
  taskType: "routine";
}
export const isRoutineTask = (routineTask: any): routineTask is RoutineTask => {
  return isTask(routineTask) && routineTask.taskType === "routine";
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

export type NoteCompletion = {
  total: number;
  uncompleted: number;
  completed: number;
  percentage: number;
  percentageRounded: number;
}