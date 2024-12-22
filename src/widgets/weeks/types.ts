import { NotePerformance } from "@entities/note";
import { Day } from "@shared/period/day";
import { Week } from "@shared/period/week";


export type DayNode = {
  day: Day;
  performance: NotePerformance;
};


export type WeekNode = {
  week: Week;
  days: DayNode[];
}