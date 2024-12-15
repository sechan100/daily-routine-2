import { DayOfWeek } from "@shared/period/day";


export type RoutineElement = Routine | RoutineGroup;
export const isRoutine = (r: Routine | RoutineGroup): r is Routine => {
  // @ts-ignore
  return r.properties.activeCriteria !== undefined;
}
export const isRoutineGroup = (r: Routine | RoutineGroup): r is RoutineGroup => {
  // @ts-ignore
  return r.properties.activeCriteria === undefined;
}

export type Routine = {
  name: string;
  properties: RoutineProperties;
};

export type RoutineProperties = {
  order: number;
  group: string;
  showOnCalendar: boolean;
  activeCriteria: "week" | "month";
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
};

export type RoutineGroup = {
  name: string;
  properties: RoutineGroupProperties;
};

export type RoutineGroupProperties = {
  order: number;
};

