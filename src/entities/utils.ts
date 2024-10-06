import { Day } from "libs/day";
import { routineNoteArchiver } from "./archive";
import { RoutineNote, routineNoteService } from "./routine-note";







// day에 해당하는 RoutineNote를 archive에서 가져오거나 없으면 새로 생성한다.
export const loadOrCreateRoutineNote = async (day: Day): Promise<RoutineNote> => {
  const routineNote = await routineNoteArchiver.load(day);
  if(routineNote){
    return routineNote;
  } else {
    const routineNote = await routineNoteService.create(day);
    routineNoteArchiver.save(routineNote);
    return routineNote;
  }
}