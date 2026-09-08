import { DR_SETTING } from "@app/settings/setting-provider"
import { Routine, RoutineGroupEntity } from "@entities/routine"
import { Day } from "@shared/period/day"


export const createNewRoutine = (): Routine => {
  return {
    name: "",
    routineElementType: "routine",
    properties: {
      order: 0,
      group: RoutineGroupEntity.UNGROUPED_NAME,
      showOnCalendar: DR_SETTING.defaultRoutineShowOnCalendar(),
      activeCriteria: "week",
      daysOfWeek: Day.getDaysOfWeek(),
      daysOfMonth: [Day.today().date],
      intervalDays: 1,
      intervalStart: Day.today().format(),
      enabled: true,
      tags: []
    }
  }
}