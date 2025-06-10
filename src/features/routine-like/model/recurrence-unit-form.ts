import { RecurrenceUnit } from "@/entities/routine";
import { DayOfWeek } from "@/shared/period/day";


export type RecurrenceUnitForm = {
  recurrenceUnit: RecurrenceUnit;
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
}