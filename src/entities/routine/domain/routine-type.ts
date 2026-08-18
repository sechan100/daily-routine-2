import { DayOfWeek } from "@shared/period/day";


export type RoutineElement = {
  routineElementType: "routine" | "routine-group";
  name: string;
  properties: {
    order: number
  };
}
export const isRoutineElement = (r: unknown): r is RoutineElement => {
  const el = r as Partial<RoutineElement>;
  const hasName = typeof el.name === "string";
  const hasRoutineElementType = el.routineElementType === "routine" || el.routineElementType === "routine-group";
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
  activeCriteria: "week" | "month" | "interval";
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
  intervalDays: number;
  intervalStart: string; // "YYYY-MM-DD"
  enabled: boolean;
  tags: string[];
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

