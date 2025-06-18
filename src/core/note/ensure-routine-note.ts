import { noteRepository } from "@/entities/repository/note-repository";
import { RoutineNote } from "@/entities/types/note";
import { Day } from "@/shared/period/day";
import { createRoutineNote } from "./create-routine-note";


/**
 * RoutineNote를 생성하거나, 또는 이미 존재하는 RoutineNote를 가져온다.
 * @param day 
 */
export const ensureRoutineNote = async (day: Day): Promise<RoutineNote> => {
  let routineNote = await noteRepository.load(day);
  if (routineNote == null) {
    routineNote = await createRoutineNote(day);
    if (day.isToday()) {
      await noteRepository.persist(routineNote);
    }
  }
  return routineNote;
}