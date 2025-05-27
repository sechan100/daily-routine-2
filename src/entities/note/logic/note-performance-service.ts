import { Checkable } from "../model/checkable";
import { RoutineNote } from "../model/note";
import { NotePerformance } from "../model/performance";
import { noteService } from "./note-service";

interface NotePerformanceService {
  getPerformance: (note: RoutineNote) => NotePerformance;
  getZeroNotePerformance: () => NotePerformance;
}
export const notePerformanceService: NotePerformanceService = {
  getPerformance: (note: RoutineNote): NotePerformance => {
    const checkables: Checkable[] = [...note.tasks, ...noteService.getAllRoutines(note)];
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
    };
  }
};
