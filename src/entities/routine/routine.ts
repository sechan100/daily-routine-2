/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day, DayOfWeek } from "@shared/day";




export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  properties: RoutineProperties; // 루틴 파일의 프로퍼티
}

export interface RoutineProperties {
  order: number; // routine들 순서(음이 아닌 정수 0, 1, 2, ...)
  showOnCalendar: boolean; // 캘린더에 표시할지 여부
  activeCriteria: "week" | "month"; // 루틴이 활성화되는 기준
  daysOfWeek: DayOfWeek[]; // 요일
  daysOfMonth: number[]; // 0 ~ 31 (0은 매월 마지막 날)
}

export const DEFAULT_ROUTINE: () => Routine = () => ({
  name: "",
  properties: {
    order: 0,
    showOnCalendar: false,
    activeCriteria: "week",
    daysOfWeek: Day.getDaysOfWeek(),
    daysOfMonth: [Day.now().getDate()],
  }
})