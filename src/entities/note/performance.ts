import { Checkable } from "./checkable";
import { noteService, RoutineNote } from "./note";


export type NotePerformance = {
  /**
   * 총 checkable한 객체의 수
   * routine, task 등을 포함한다.
   */
  totalCheckable: number;

  /**
   * 완료된 checkable의 수
   * '완료'는 CheckableState가 'un-checked'가 아닌 모든 상태를 의미하낟.
   */
  completedCheckable: number;

  /**
   * 완료되지 않은 checkable의 수
   * '완료되지 않음'은 CheckableState가 'un-checked'인 상태를 의미한다. 
   */
  uncompletedCheckable: number;

  /**
   * '완료'된 checkable의 백분율
   */
  completionPercentage: number;

  /**
   * 'accomplished' 상태의 checkable의 수
   */
  accomplishedCheckable: number;

  /**
   * 'accomplished' 상태의 checkable의 백분율
   */
  accomplishmentPercentage: number;
}


interface NotePerformanceService {
  getPerformance: (note: RoutineNote) => NotePerformance;
  getZeroNotePerformance: () => NotePerformance;
}
export const notePerformanceService: NotePerformanceService = {
  getPerformance: (note: RoutineNote): NotePerformance => {
    const checkables: Checkable[] = [...note.tasks, ...noteService.getAllRoutines(note)]
    const totalCheckable = checkables.length;
    const completedCheckable = checkables.filter(t => t.state !== "un-checked").length;
    const uncompletedCheckable = totalCheckable - completedCheckable;
    const completionPercentage = totalCheckable === 0 ? 0 : (completedCheckable / totalCheckable) * 100;
    const accomplishedCheckable = checkables.filter(t => t.state === "accomplished").length;
    const accomplishmentPercentage = totalCheckable === 0 ? 0 : (accomplishedCheckable / totalCheckable) * 100;
    return {
      totalCheckable,
      completedCheckable,
      completionPercentage,
      uncompletedCheckable,
      accomplishedCheckable,
      accomplishmentPercentage,
    };
  },

  getZeroNotePerformance: (): NotePerformance => {
    return {
      totalCheckable: 0,
      completedCheckable: 0,
      completionPercentage: 0,
      uncompletedCheckable: 0,
      accomplishedCheckable: 0,
      accomplishmentPercentage: 0,
    }
  }

}