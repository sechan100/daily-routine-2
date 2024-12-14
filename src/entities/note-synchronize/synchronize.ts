import { NoteRepository, RoutineNote } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";
import { TaskCheckedStateNoteDep } from "./dependents/TaskCheckedStateNoteDep";
import { TodoTaskNoteDep } from "./dependents/TodoTaskNoteDep";




type AllRecreatedNoteCb = (notes: RoutineNote[]) => void;
/**
 * 오늘의 노트부터 미래의 모든 노트들을, 새롭게 업데이트된 루틴들을 기반으로 동기화한다.
 */
export interface RoutineNoteSynchronizer {
  // @param cb 동기화 완료후 실행할 콜백
  (cb: AllRecreatedNoteCb): void;
  (excludeDay?: Day): void;
  (): void;
}

export const executeRoutineNotesSynchronize: RoutineNoteSynchronizer = async (arg?) => {
  const noteCreator = await RoutineNoteCreator.withLoadFromRepositoryAsync();

  const doSync = async (note: RoutineNote): Promise<RoutineNote> => {
    const day = note.getDay();
    // note로부터 NoteDepentdent를 추출한다. 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
    const dependents = [
      new TodoTaskNoteDep(note),
      new TaskCheckedStateNoteDep(note),
    ]
    await NoteRepository.delete(day);
    const newNote = noteCreator.create(day);
    for(const dep of dependents){
      dep.restoreData(note);
    }
    await NoteRepository.persist(newNote);
    return newNote;
  }

  // 모든 등록된 비동기 로직 이후에 실행을 예약
  Promise.resolve().then(async () => {
    let notes = await NoteRepository.loadBetween(Day.now(), Day.max());
    if(arg instanceof Day){
      notes = notes.filter(n => !n.getDay().isSameDay(arg));
    }
    const syncedNotes = await Promise.all(notes.map(doSync));
    if(typeof arg === 'function'){
      (arg as AllRecreatedNoteCb)(syncedNotes);
    }
  })
}