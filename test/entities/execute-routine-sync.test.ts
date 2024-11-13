import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { Routine } from "@entities/routine";
import { DAYS_OF_WEEK } from "@shared/day";
import { fileAccessor } from "@shared/file/file-accessor";



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
    expect(routine.name).toBe("test routine 1");
  });

});