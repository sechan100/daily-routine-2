import { noteService, RoutineNote } from "@/entities/note";
import { Day } from "@/shared/period/day";


/**
 * RoutineNote를 생성하거나, 또는 이미 존재하는 RoutineNote를 가져온다.
 * @param day 
 */
export const ensureRoutineNote = async (day: Day): Promise<RoutineNote> => {
  let routineNote = await noteService.load(day);
  if (routineNote == null) {
    routineNote = await noteService.create(day);
    if (day.isToday()) {
      await noteService.persist(routineNote);
    }
  }
  return routineNote;
}