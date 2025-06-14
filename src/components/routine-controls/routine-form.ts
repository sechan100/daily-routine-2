import { RecurrenceUnit } from '@/entities/types/routine';
import { DayOfWeek } from '@/shared/period/day';




export type RoutineForm = {
  name: string;
  recurrenceUnit: RecurrenceUnit;
  showOnCalendar: boolean;
  daysOfWeek: DayOfWeek[];
  daysOfMonth: number[];
  enabled: boolean;
}