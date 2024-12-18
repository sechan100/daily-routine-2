/* eslint-disable @typescript-eslint/no-explicit-any */
import { DayOfWeek } from "@shared/period/day";


export type RoutineElement<> = {
  routineElementType: "routine" | "routine-group";
  name: string;
  properties: {
    order: number
  };
}
export const isRoutineElement = (r: any): r is RoutineElement => {
  const hasName = typeof r.name === "string";
  const hasRoutineElementType = r.routineElementType === "routine" || r.routineElementType === "routine-group";
  return hasName && hasRoutineElementType;
}

export type Routine = RoutineElement & {
  routineElementType: "routine";
  properties: RoutineProperties;
};
export const isRoutine = (r: RoutineElement): r is Routine => {
  return r.routineElementType === "routine";
}

export type RoutineProperties = {
  order: number;
  group: string;
  showOnCalendar: boolean;
  activeCriteria: "week" | "month";
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
};

export type RoutineGroup = RoutineElement & {
  routineElementType: "routine-group";
  properties: RoutineGroupProperties;
};
export const isRoutineGroup = (r: RoutineElement): r is RoutineGroup => {
  return r.routineElementType === "routine-group";
}

export type RoutineGroupProperties = {
  order: number;
};

