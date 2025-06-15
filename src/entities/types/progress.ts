

export type CheckableGroupProgress = {
  // 전체
  total: number;

  // state != 'un-checked' 것들
  completed: number;
  completedPct: number;

  // state = 'un-checked' 것들
  uncompleted: number;
  uncompletedPct: number;

  // state = 'accomplished' 것들
  accomplished: number;
  accomplishedPct: number;
}

export type NoteProgress = {
  /**
   * @deprecated
   * 총 checkable한 객체의 수
   * routine, task 등을 포함한다.
   */
  totalCheckable: number;

  /**
   * @deprecated
   * 완료된 checkable의 수
   * '완료'는 CheckableState가 'un-checked'가 아닌 모든 상태를 의미한다.
   */
  completedCheckable: number;

  /**
   * @deprecated
   * 완료되지 않은 checkable의 수
   * '완료되지 않음'은 CheckableState가 'un-checked'인 상태를 의미한다. 
   */
  uncompletedCheckable: number;

  /**
   * @deprecated
   * '완료'된 checkable의 백분율
   */
  completionPercentage: number;

  /**
   * 'accomplished' 상태의 checkable의 수
   */
  accomplishedCheckable: number;

  /**
   * @deprecated
   * 'accomplished' 상태의 checkable의 백분율
   */
  accomplishmentPercentage: number;

  total: CheckableGroupProgress;
  tasks: CheckableGroupProgress;
  routines: CheckableGroupProgress;
}



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