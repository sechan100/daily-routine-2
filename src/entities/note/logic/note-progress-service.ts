import { Checkable } from "../model/checkable";
import { RoutineNote } from "../model/note";
import { CheckableGroupProgress, NoteProgress } from "../model/progress";
import { routineTreeService } from "./routine-tree-service";

const getCheckableGroupProgress = (checkables: Checkable[]): CheckableGroupProgress => {
  const total = checkables.length;
  const completed = checkables.filter(t => t.state !== "un-checked").length;
  const uncompleted = checkables.filter(t => t.state === "un-checked").length;
  const accomplished = checkables.filter(t => t.state === "accomplished").length;
  return {
    total,
    completed,
    completedPct: total === 0 ? 0 : (completed / total) * 100,
    uncompleted,
    uncompletedPct: total === 0 ? 0 : (uncompleted / total) * 100,
    accomplished,
    accomplishedPct: total === 0 ? 0 : (accomplished / total) * 100,
  };
}

interface NoteProgressService {
  getProgress: (note: RoutineNote) => NoteProgress;
  getZeroNoteProgress: () => NoteProgress;
}
export const noteProgressService: NoteProgressService = {
  getProgress: (note: RoutineNote): NoteProgress => {
    const tasks = note.tasks;
    const routines = routineTreeService.getAllRoutines(note.routienTree);
    const checkables: Checkable[] = [...tasks, ...routines];
    const totalCheckable = checkables.length;
    const completedCheckable = checkables.filter(t => t.state !== "un-checked").length;
    const uncompletedCheckable = totalCheckable - completedCheckable;
    const completionPercentage = totalCheckable === 0 ? 0 : (completedCheckable / totalCheckable) * 100;
    const accomplishedCheckable = checkables.filter(t => t.state === "accomplished").length;
    const accomplishmentPercentage = totalCheckable === 0 ? 0 : (accomplishedCheckable / totalCheckable) * 100;

    const tasksProgress = getCheckableGroupProgress(tasks);
    const routinesProgress = getCheckableGroupProgress(routines);
    const totalProgress = getCheckableGroupProgress(checkables);
    return {
      totalCheckable,
      completedCheckable,
      completionPercentage,
      uncompletedCheckable,
      accomplishedCheckable,
      accomplishmentPercentage,
      total: totalProgress,
      tasks: tasksProgress,
      routines: routinesProgress,
    };
  },

  getZeroNoteProgress: (): NoteProgress => {
    const zeroCheckableGroupProgress: CheckableGroupProgress = {
      total: 0,
      completed: 0,
      completedPct: 0,
      uncompleted: 0,
      uncompletedPct: 0,
      accomplished: 0,
      accomplishedPct: 0,
    };
    return {
      totalCheckable: 0,
      completedCheckable: 0,
      completionPercentage: 0,
      uncompletedCheckable: 0,
      accomplishedCheckable: 0,
      accomplishmentPercentage: 0,
      total: zeroCheckableGroupProgress,
      tasks: zeroCheckableGroupProgress,
      routines: zeroCheckableGroupProgress,
    };
  }
};
