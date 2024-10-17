/* eslint-disable @typescript-eslint/no-explicit-any */
import { keys } from "lodash";
import { DayOfWeek } from "shared/day";


/**
 * 루틴 파일에 대한 정보 객체
 */


export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  properties: RoutineProperties; // 루틴 파일의 프로퍼티
}




export interface RoutineProperties {
  order: number; // routine들 순서(음이 아닌 정수 0, 1, 2, ...)
  activeCriteria: "week" | "month"; // 루틴이 활성화되는 기준
  daysOfMonth: number[]; // 0 ~ 31 (0은 매월 마지막 날)
  daysOfWeek: DayOfWeek[]; // 요일
}



/**
 * obsidian api에서 반환된 js object 형식의 frontmatter가 RoutineProperties 타입인지 확인하는 타입가드
 * @param fm js object로 변환된 frontmatter
 */

export function validateRoutineProperties(fm: any): fm is RoutineProperties {
  console.log(fm);
  // order
  const hasOrder = 'order' in fm && typeof fm.order === 'number';
  if(!hasOrder) return false;

  // activeCriteria
  const hasActiveCriteria = 'activeCriteria' in fm &&
    (fm.activeCriteria === 'week' || fm.activeCriteria === 'month');
  if(!hasActiveCriteria) return false;

  // daysOfWeek
  const validDaysOfWeekIfHas = 'daysOfWeek' in fm &&
    Array.isArray(fm.daysOfWeek) &&
    fm.daysOfWeek.every((d: any) => typeof d === 'string' && keys(DayOfWeek).includes(d));

  // daysOfMonth
  const validDaysOfMonthIfHas = 'daysOfMonth' in fm &&
    Array.isArray(fm.daysOfMonth) &&
    fm.daysOfMonth.every((d: any) => typeof d === 'number' && d >= 0 && d <= 31);

  // daysOfWeek OR daysOfMonth 
  if(!(validDaysOfMonthIfHas && validDaysOfWeekIfHas)) return false;

  return true;
}

