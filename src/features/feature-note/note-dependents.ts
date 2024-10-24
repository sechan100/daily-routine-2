import { RoutineNote } from "entities/note";



export abstract class NoteDepentdent {

  /**
   * 노트에 의존적인 데이터를 기존의 노트로 부터 분리해냈기 때문에, 이를 다시 새로운 노트에 복원해내야한다.
   */
  abstract restoreData(newNote: RoutineNote): RoutineNote;
}