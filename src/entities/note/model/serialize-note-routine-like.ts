import { CheckableState, checkboxChars, deserializeCheckableState, serializeCheckableState } from '@/entities/checkable';
import dedent from "dedent";
import { NoteRoutine, NoteRoutineGroup } from "../types/note-routine-like";


const deserializeError = (message: string): Error => new Error(`[NoteRoutine Deserialize Error]: ${message}`);

// Routine =============================================================
/**
 * @returns '- [ ] [[name]]'
 */
export const serializeNoteRoutine = (routine: NoteRoutine): string => {
  const s = serializeCheckableState(routine.state);
  return `- [${s}] [[${routine.name}]]`;
}

/**
 * routine을 표현하는 문자열 line을 받아서 NoteRoutine 객체로 변환한다.
 * @param routineLine '- [x] [[name]]'과 같은 형식의 문자열
 * @returns 
 */
export const deserializeNoteRoutine = (routineLine: string): NoteRoutine => {
  routineLine = routineLine.trim();
  if (routineLine === '') throw deserializeError("routine line is empty");
  // 체크박스인 [] 안에 들어갈 수 있는 문자들 (' ', 'x', 'X', 'f', 'F' 등)
  const avaliableCheckMarkChars = [' ', ...checkboxChars.accomplished, ...checkboxChars.failed];
  const regex = new RegExp(`-\\s*\\[(${avaliableCheckMarkChars.join('|')})\\]\\s*(\\[\\[(.*?)\\]\\]|(.*?))`);
  const match = routineLine.match(regex);
  if (!match) throw deserializeError('invalid routine line format');
  const name = match[3] || match[4];
  const state: CheckableState = deserializeCheckableState(match[1]);
  return {
    name,
    routineLikeType: "routine",
    state
  }
}

// RoutineGroup ============================================================

/**
 * 
 * @param group 
 * @returns 
 * '
 * ## RoutineGroupName
 * - [ ] [[Routine1]]
 * - [x] [[Routine2]]
 * - [f] [[Routine3]]
 * '과 같은 형식의 문자열
 */
export const serializeNoteRoutineGroup = (group: NoteRoutineGroup): string => {
  return dedent`
    ## ${group.isOpen ? group.name : `(${group.name})`}
    ${group.routines.map(t => serializeNoteRoutine(t)).join('\n')}
  `;
}

/**
 * 
 * @param block: 
 * ```
 * ## RoutineGroupName
 * - [ ] [[Routine1]]
 * - [x] [[Routine2]]
 * - [f] [[Routine3]]
 * ```
 * 과 같은 형식의 마크다운 블록
 */
export const deserializeNoteRoutineGroup = (block: string): NoteRoutineGroup => {
  block = block.trim();
  if (block === '') throw deserializeError("routine group block is empty");
  const regex = /##\s*(.+?)\s*(?:\n([\s\S]*?))?(?=\n##|$)/;
  const match = block.match(regex);
  if (!match) throw deserializeError('invalid routine group format');
  const taskLines = match[2]?.trim().split("\n") ?? [];
  const rawName = match[1].trim();
  const isOpen = !/^\(.*\)$/.test(rawName); // 괄호로 감싸져 있으면 false, 아니면 true
  const name = rawName.replace(/^\((.*)\)$/, '$1').trim(); // 괄호 제거
  return {
    name,
    routineLikeType: 'routine-group',
    routines: taskLines.map(l => deserializeNoteRoutine(l)),
    isOpen
  };
}
