import { Day } from "@shared/period/day";
import { Week } from "@shared/period/week";


export type DayNode = {
  day: Day;
  percentage: number;
};


export type WeekNode = {
  week: Week;
  days: DayNode[];
}