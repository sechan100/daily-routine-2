

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


