import { Routine } from "entities/routine";
import { moment } from "obsidian";
import { DAYS_OF_WEEK } from "shared/day";
import { plugin } from "shared/plugin-service-locator";



describe('executeRoutineSync', () => {
  const routine: Routine = {
    name: "test routine 1",
    properties: {
      order: 10,
      activeCriteria: "week",
      daysOfWeek: DAYS_OF_WEEK,
      daysOfMonth: [],
    }
  }

  test('should execute a routine synchronously', () => {
    console.log(moment().format("YYYY-MM-DD"));
    expect(routine.name).toBe("test routine 1");
  });

});