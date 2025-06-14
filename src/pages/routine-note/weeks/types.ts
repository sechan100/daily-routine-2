import { NoteProgress } from "@/entities/types/progress";
import { Day } from "@/shared/period/day";
import { Week } from "@/shared/period/week";


export type DayNode = {
  day: Day;
  progress: NoteProgress;
};


export type WeekNode = {
  week: Week;
  days: DayNode[];
}