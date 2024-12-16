import { Routine, RoutineGroupEntity } from "@entities/routine"
import { Day } from "@shared/period/day"


export const createNewRoutine = (): Routine => {
  return {
    name: "",
    properties: {
      order: 0,
      group: RoutineGroupEntity.UNGROUPED_NAME,
      showOnCalendar: false,
      activeCriteria: "week",
      daysOfWeek: Day.getDaysOfWeek(),
      daysOfMonth: [Day.now().date],
    }
  }
}