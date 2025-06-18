/**
 * case는 over를 기준으로 서술됨
 */
export type DndCase =
  // 앞에 삽입
  "insert-before" |
  // 뒤에 삽입
  "insert-after" |
  // 첫 번째 자식으로 삽입
  "insert-into-first" |
  // 마지막 자식으로 삽입
  "insert-into-last";
