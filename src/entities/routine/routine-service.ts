import { Routine } from "./routine";
import { Day } from "@shared/period/day";
import { RoutineTask } from "@entities/note";


interface RoutineService {

  isRoutineDueTo(routine: Routine, day: Day): boolean;
  
  deriveRoutineToTask(routine: Routine): RoutineTask;
}
export const RoutineService: RoutineService = {

  /**
   * NOTE: daysOfWeek와 daysOfMonth를 기준으로 루틴을 수행할지 말지를 결정한다.
   * - daysOfMonth가 0인 경우는 매월의 마지막 날을 의미한다.
   */
  isRoutineDueTo(routine: Routine, day: Day): boolean {

    // MONTH 기준
    if (routine.properties.activeCriteria === "month") {
      const days = Array.from(routine.properties.daysOfMonth);
      // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
      if(days.contains(0)) {
        const lastDayOfMonth = day.daysInMonth();
        days.remove(0);
        days.push(lastDayOfMonth);
      }
      if (!days.contains(day.date)) return false;
    }

    // WEEK 기준
    if (routine.properties.activeCriteria === "week") {
      if (!routine.properties.daysOfWeek.contains(day.getDow())) return false;
    }

    return true;
  },

  deriveRoutineToTask(routine: Routine): RoutineTask {
    return {
      type: "routine",
      name: routine.name,
      checked: false,
      showOnCalendar: false
    }
  },

}