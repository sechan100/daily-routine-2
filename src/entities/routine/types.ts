import { DayOfWeek } from "@shared/period/day";




export interface RoutineDto {
  name: string;
  properties: RoutinePropertiesDto;
}

export interface RoutinePropertiesDto {
  order: number;
  group: string;
  showOnCalendar: boolean;
  activeCriteria: "week" | "month";
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
}

export interface RoutineGroupDto {
  name: string;
  properties: {
    order: number;
  }
}