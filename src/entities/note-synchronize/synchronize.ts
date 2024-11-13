import { RoutineNote, routineNoteArchiver, routineNoteService } from "@entities/note";
import { TaskCheckedStateNoteDep } from "./dependents/TaskCheckedStateNoteDep";
import { TodoTaskNoteDep } from "./dependents/TodoTaskNoteDep";
import { Day } from "@shared/day";




type AllRecreatedNoteCb = (notes: RoutineNote[]) => void;
type SpecificDayNoteCb = (note: RoutineNote) => void;
/**
 * 오늘의 노트부터 미래의 모든 노트들을, 새롭게 업데이트된 루틴들을 기반으로 동기화한다.
 */
export interface RoutineNoteSynchronizer {
  // @param cb 동기화 완료후 실행할 콜백
  (cb: AllRecreatedNoteCb): void;

  /**
   * 동기화 로직 이후에, day로 지정한 날짜에 해당하는 RoutineNote를 cb의 매개로 전달한다.
   * 만약 실제 note가 존재하지 않아도 transient한 note 데이터를 매개해준다.
   * @param day cb로 받을 날짜
   */
  (cb: SpecificDayNoteCb, day: Day): void;

  (): void;
}

export const executeRoutineNotesSynchronize: RoutineNoteSynchronizer
= (cb?, day?) => {
  // 모든 등록된 비동기 로직 이후에 실행을 예약
  Promise.resolve().then(async () => {
    const notes = await routineNoteArchiver.loadBetween(Day.now(), Day.max());
    const syncedNotes: RoutineNote[] = [];
    for(const note of notes){
      const synced = await synchronizeRoutineNote(note);
      syncedNotes.push(synced);
    }

    if(day){
      let note = syncedNotes.find(n => n.day.isSameDay(day as Day));
      if(!note){
        note = await routineNoteService.create(day as Day);
      }
      (cb as SpecificDayNoteCb)(note);
    } else {
      (cb as AllRecreatedNoteCb)(syncedNotes);
    }
  })
}



const synchronizeRoutineNote = async (note: RoutineNote): Promise<RoutineNote> => {
  /**
   * note로부터 NoteDepentdent를 추출한다.
   * 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
   */
  const dependents = [
    new TodoTaskNoteDep(note),
    new TaskCheckedStateNoteDep(note),
  ]
  
  await routineNoteArchiver.delete(note.day);
  const syncedNote = await routineNoteService.create(note.day);

  const restoredNote = dependents.reduce((note, dep) => {
    return dep.restoreData(note);
  }, syncedNote);

  await routineNoteArchiver.persist(restoredNote);
  return restoredNote;
}
