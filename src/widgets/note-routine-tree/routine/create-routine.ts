import { Routine, UNGROUPED_GROUP_NAME } from "@/entities/routine-like"
import { Day } from "@/shared/period/day"


export const createNewRoutine = (): Routine => {
  return {
    name: "",
    link: "",
    routineLikeType: "routine",
    properties: {
      order: 0,
      group: UNGROUPED_GROUP_NAME,
      showOnCalendar: false,
      recurrenceUnit: "week",
      daysOfWeek: Day.getDaysOfWeek(),
      daysOfMonth: [Day.today().date],
      enabled: true
    }
  }
}