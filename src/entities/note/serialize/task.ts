import { CheckableState } from "../checkable";
import { Task, TaskProperties } from "../task";
import { checkboxChars, deserializeCheckableState, serializeCheckableState } from "./checkable";
import { deserializeError } from "./utils";

/**
 * Task 객체를 직렬화한 line 문자열을 반환한다.
 * @param task 
 * @returns 
 */
export const serializeTask = (task: Task) => {
  const state = serializeCheckableState(task.state);
  const { showOnCalendar } = task.properties;
  const propertiesArray = [Number(showOnCalendar)]
  return `- [${state}] ${task.name}%%(${propertiesArray.toString()})%%`;
}

/**
 * 
 * @param propertiesArray {1, 3}과 같은 형식의 문자열
 */
const deserializeTaskProperties = (propertiesArray: string): TaskProperties => {
  propertiesArray = propertiesArray.trim();
  if (propertiesArray === '') throw deserializeError('task properties array is empty');
  // 현재 TaskPropertiesArray에 따라 변경이 필요하다.
  // 현재는 '{showOnCalendar(0 또는 1)}' 이다.
  const regex = /\{(\d+)\}/g;
  const match = propertiesArray.match(regex);
  if (!match) throw deserializeError('invalid task properties format');
  const showOnCalendar = Boolean(match[0]);
  return {
    showOnCalendar
  };
}

/**
 * 주어진 Task line 문자열을 Task 객체로 변환한다.
 * 
 * @param line - `- [x] [[TaskName]]%%{1, 2}%%`와 같은 형식의 문자열
 * 뒤에 오는 Properties는 배열이므로, 인덱스마다 그 타입과 의미가 다르다. 
 * 자세한 내용은 TaskPropertiesArray, TaskProperties을 참고
 * @returns 
 */
export const deserializeTask = (line: string): Task => {
  line = line.trim();
  if (line === '') throw deserializeError('task line is empty');
  // 체크박스인 [] 안에 들어갈 수 있는 문자들 (' ', 'x', 'X', 'f', 'F' 등)
  const avaliableCheckMarkChars = [' ', ...checkboxChars.accomplished, ...checkboxChars.failed];
  const regex = new RegExp(`-\\s*\\[(${avaliableCheckMarkChars.join('|')})\\]\\s*(\\[\\[(.*?)\\]\\]|(.*?))\\s*%%(.*?)%%`);
  const match = line.match(regex);
  if (!match) throw deserializeError('invalid-task-format');
  const name = match[3] || match[4];
  const state: CheckableState = deserializeCheckableState(match[1]);
  const properties: TaskProperties = deserializeTaskProperties(match[5]);
  return {
    name,
    state,
    properties,
  }
}