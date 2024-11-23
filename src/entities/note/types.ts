import { Day } from "@shared/period/day";


export type TaskType = "routine" | "todo";
export interface Task {
  type: TaskType;
  name: string;
  checked: boolean;
  showOnCalendar: boolean;
}
export interface RoutineTask extends Task { }
export interface TodoTask extends Task { }
export interface TaskMetaData {
  type: TaskType;
  soc: boolean; // showOnCalendar
}


export interface RoutineNote {
  day: Day;
  tasks: Task[];
}
export interface TaskCompletion {
  total: number;
  uncompleted: number;
  completed: number;
  percentage: number;
  percentageRounded: number;
}
