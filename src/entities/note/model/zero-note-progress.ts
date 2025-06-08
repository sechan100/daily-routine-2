import { CheckableGroupProgress, NoteProgress } from "../types/progress";



const ZERO_CHECKABLE_GROUP_PROGRESS: CheckableGroupProgress = {
  total: 0,
  completed: 0,
  completedPct: 0,
  uncompleted: 0,
  uncompletedPct: 0,
  accomplished: 0,
  accomplishedPct: 0,
}

export const ZERO_NOTE_PROGRESS: NoteProgress = {
  totalCheckable: 0,
  completedCheckable: 0,
  completionPercentage: 0,
  uncompletedCheckable: 0,
  accomplishedCheckable: 0,
  accomplishmentPercentage: 0,
  total: ZERO_CHECKABLE_GROUP_PROGRESS,
  tasks: ZERO_CHECKABLE_GROUP_PROGRESS,
  routines: ZERO_CHECKABLE_GROUP_PROGRESS,
}