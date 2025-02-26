import { noteRepository, RoutineNote } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";


/**
 * 최종적으로 RoutineNote 데이터를 가져오고 처리하는 일련의 과정을 수행한다.
 * note가 존재한다면 반환하고, 존재하지 않는다면 생성한 다음 오늘에 해당하는 노트라면 저장하는등의 복잡한 과정을 수행할 수 있다.
 */
export const resolveRoutineNote = async (day: Day): Promise<RoutineNote> => {
  let routineNote = await noteRepository.load(day);
  if(!routineNote){
    const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();
    routineNote = noteCreator.create(day);
    if(day.isToday()){
      await noteRepository.persist(routineNote);
    }
  }
  return routineNote;
}