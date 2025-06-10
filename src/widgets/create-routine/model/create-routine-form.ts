import { RecurrenceUnit } from '@/entities/routine';
import { DayOfWeek } from '@/shared/period/day';




export type CreateRoutineForm = {
  name: string;
  recurrenceUnit: RecurrenceUnit;
  showOnCalendar: boolean;
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
}