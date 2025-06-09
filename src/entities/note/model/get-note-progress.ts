import { Checkable } from "../../checkable/types/checkable";
import { RoutineNote } from "../types/note";
import { CheckableGroupProgress, NoteProgress } from "../types/progress";
import { routineTreeUtils } from "./routine-tree-utils";


const getCheckableGroupProgress = (checkables: Checkable[]): CheckableGroupProgress => {
  const total = checkables.length;
  const completed = checkables.filter(t => t.state !== "unchecked").length;
  const uncompleted = checkables.filter(t => t.state === "unchecked").length;
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

export const getNoteProgress = (note: RoutineNote): NoteProgress => {
  const tasks = note.tasks;
  const routines = routineTreeUtils.getAllRoutines(note.routineTree);
  const checkables: Checkable[] = [...tasks, ...routines];
  const totalCheckable = checkables.length;
  const completedCheckable = checkables.filter(t => t.state !== "unchecked").length;
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
}
