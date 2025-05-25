import { NoteRepository, RoutineNote } from "@/entities/note";
import { RoutineNoteCreator } from '@/entities/routine-to-note';
import { Day } from "@/shared/period/day";


/**
 * RoutineNote를 생성하거나, 또는 이미 존재하는 RoutineNote를 가져온다.
 * @param day 
 */
export const ensureRoutineNote = async (day: Day): Promise<RoutineNote> => {
  let routineNote = await NoteRepository.load(day);
  if (!routineNote) {
    const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
    routineNote = noteCreator.create(day);
    if (day.isToday()) {
      await NoteRepository.persist(routineNote);
    }
  }
  return routineNote;
}