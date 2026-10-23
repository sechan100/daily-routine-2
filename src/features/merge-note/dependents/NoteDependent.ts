import { RoutineNote } from "@entities/note";



export abstract class NoteDependent {

  /**
   * 노트에 의존적인 데이터를 기존의 노트로 부터 분리해냈기 때문에, 이를 다시 새로운 노트에 복원해내야한다.
   * 매개받은 노트는 바꾸지 않고, 복원한 새 노트를 반환한다.
   */
  abstract restoreData(newNote: RoutineNote): RoutineNote;
}