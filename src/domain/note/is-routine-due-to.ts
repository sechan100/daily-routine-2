import { Routine } from '@/entities/types/routine';
import { Day } from '@/shared/period/day';

/**
 * routine의 여러 properties들을 분석하여, day에 루틴을 수행해야하는지의 여부를 반환한다.
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
