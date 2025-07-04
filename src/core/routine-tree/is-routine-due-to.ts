import { Routine } from '@/entities/types/routine';
import { Day } from '@/shared/period/day';

/**
 * routine을 분석하여, 해당 day에 해야하는 routine인지를 판단한다.
 */
export const isRoutineDueTo = (routine: Routine, day: Day): boolean => {
  const p = routine.properties;
  if (!p.enabled) return false;
  if (p.recurrenceUnit === "month") {
    const days = Array.from(p.daysOfMonth);
    // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
    if (days.contains(0)) {
      const lastDayOfMonth = day.daysInMonth();
      days.remove(0);
      days.push(lastDayOfMonth);
    }
    if (!days.contains(day.date)) return false;
  }
  else if (p.recurrenceUnit === "week") {
    if (!p.daysOfWeek.contains(day.dow)) return false;
  }
  else {
    throw new Error('Invalid recurrenceUnit');
  }
  return true;
};
