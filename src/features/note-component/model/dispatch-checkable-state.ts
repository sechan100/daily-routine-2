import { CheckableState } from "@/entities/checkable";





/**
 * 기본적인 변경 동작인 click이 발생했을 때, 다음 checkable state를 구하는 함수이다.
 */
export const getNextCheckableState = (state: CheckableState): CheckableState => {
  switch (state) {
    case "unchecked":
      return "accomplished";
    case "accomplished":
    // intentional-fallthrough
    case "failed":
      return "unchecked";
    default:
      throw new Error(`Unknown checkable state: ${state}`);
  }
}