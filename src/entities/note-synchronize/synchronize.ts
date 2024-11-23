import { RoutineNote, NoteRepository, NoteService } from "@entities/note";
import { TaskCheckedStateNoteDep } from "./dependents/TaskCheckedStateNoteDep";
import { TodoTaskNoteDep } from "./dependents/TodoTaskNoteDep";
import { Day } from "@shared/period/day";
import { Routine, RoutineRepository } from "@entities/routine";




type AllRecreatedNoteCb = (notes: RoutineNote[]) => void;
/**
 * 오늘의 노트부터 미래의 모든 노트들을, 새롭게 업데이트된 루틴들을 기반으로 동기화한다.
 */
export interface RoutineNoteSynchronizer {
  // @param cb 동기화 완료후 실행할 콜백
  (cb: AllRecreatedNoteCb): void;

  (): void;
}

export const executeRoutineNotesSynchronize: RoutineNoteSynchronizer = async (cb?) => {
  const routines: Routine[] = await RoutineRepository.loadAll();
  const createSyncecNote = NoteService.setLoaderForCreate(() => routines);

  const doSync = async (note: RoutineNote): Promise<RoutineNote> => {
    // note로부터 NoteDepentdent를 추출한다. 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
    const dependents = [
      new TodoTaskNoteDep(note),
      new TaskCheckedStateNoteDep(note),
    ]
    await NoteRepository.delete(note.day);

    const newlyCreatedNote = createSyncecNote(note.day);
    const restoredNote = dependents.reduce((note, dep) => {
      return dep.restoreData(note);
    }, newlyCreatedNote);
    NoteRepository.persist(restoredNote);
    return restoredNote;
  }

  // 모든 등록된 비동기 로직 이후에 실행을 예약
  Promise.resolve().then(async () => {
    const notes = await NoteRepository.loadBetween(Day.now(), Day.max());
    const syncedNotes = await Promise.all(notes.map(doSync));
    if(cb){
      (cb as AllRecreatedNoteCb)(syncedNotes);
    }
  })
}