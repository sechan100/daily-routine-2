import { RecurrenceUnit } from "@/entities/types/routine";
import { DayOfWeek } from "@/shared/period/day";


export type RecurrenceUnitForm = {
  recurrenceUnit: RecurrenceUnit;
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
}