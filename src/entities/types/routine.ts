/* eslint-disable @typescript-eslint/no-explicit-any */
import { DayOfWeek } from "@/shared/period/day";
import { RoutineLike } from "./routine-like";

export type RecurrenceUnit = "week" | "month";

export type RoutineProperties = {
  order: number;
  showOnCalendar: boolean;
  recurrenceUnit: RecurrenceUnit;
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
  group: string;
  enabled: boolean;
}

export interface Routine extends RoutineLike {
  link: string;
  userContent: string;
  routineLikeType: "routine";
  properties: RoutineProperties;
}

export const isRoutine = (r: RoutineLike): r is Routine => {
  return r.routineLikeType === "routine";
}



