import { CheckableState, checkboxChars, deserializeCheckableState, serializeCheckableState } from '@/entities/checkable';
import { Task, TaskProperties } from "../types/task";


type SerializedTaskProperties = {
  c: number; // showOnCalendar
}

const deserializeError = (message: string) => new Error(`[Task Deserialize Error]: ${message}`);

/**
 * Task 객체를 직렬화한 line 문자열을 반환한다.
 * @param task 
 * @returns 
 */
export const serializeTask = (task: Task) => {
  const state = serializeCheckableState(task.state);
  const serializedTaskProperties: SerializedTaskProperties = {
    c: Number(task.properties.showOnCalendar) // showOnCalendar
  };
  return `- [${state}] ${task.name}%%${JSON.stringify(serializedTaskProperties)}%%`;
}

/**
 * 
 * @param serializedPropertiesStr 직렬화된 SerializedTaskProperties 타입
 */
const deserializeTaskProperties = (serializedPropertiesStr: string): TaskProperties => {
  serializedPropertiesStr = serializedPropertiesStr.trim();
  if (serializedPropertiesStr === '') throw deserializeError('task properties array is empty');
  const serializedProperties: SerializedTaskProperties = JSON.parse(serializedPropertiesStr);
  // properties 타입 검증
  if (typeof serializedProperties.c !== 'number') {
    throw deserializeError('invalid task properties format: expected a number for showOnCalendar');
  }
  return {
    showOnCalendar: Boolean(serializedProperties.c)
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