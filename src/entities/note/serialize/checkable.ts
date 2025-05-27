import { CheckableState } from "../checkable";
import { deserializeError } from "./utils";

// 변환시에는 0번 인덱스 글자가 우선 사용
export const checkboxChars = {
  accomplished: ['x', 'X'],
  failed: ['f', 'F'],
}

/**
 * state를 [ ] 안에 들어갈 수 있는 종류의 문자로 변환한다.
 * 
 * @param state - CheckableState 타입의 상태
 * @returns 
 */
export const serializeCheckableState = (state: CheckableState): string => {
  if (state === 'un-checked') {
    return ' ';
  }
  else if (state === 'accomplished') {
    return checkboxChars.accomplished[0];
  }
  else if (state === 'failed') {
    return checkboxChars.failed[0];
  }
  else {
    throw new Error(`Invalid CheckableState: ${state}. Valid states are 'un-checked', 'accomplished', 'failed'.`);
  }
}


/**
 * 체크박스 안에 있는 문자에 따라 적절한 CheckableState로 매핑해준다.
 * @param checkboxChar - [x]에서 x에 해당하는 등의 문자
 * @returns 
 */
export const deserializeCheckableState = (checkboxChar: string): CheckableState => {
  if (checkboxChars.accomplished.includes(checkboxChar)) {
    return 'accomplished';
  } else if (checkboxChars.failed.includes(checkboxChar)) {
    return 'failed';
  } else if (checkboxChar === ' ') {
    return 'un-checked';
  } else {
    throw deserializeError(`invalid task state char '${checkboxChar}'. valid chars are ${[...checkboxChars.accomplished, ...checkboxChars.failed, ' '].join(', ')}`);
  }
}