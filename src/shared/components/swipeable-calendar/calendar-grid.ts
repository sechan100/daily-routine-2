import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";


// BaseCalendar의 요일 행 높이(px). 슬라이드 높이에서 주 행들이 쓸 수 있는 높이를 계산할 때 뺀다.
export const CALENDAR_WEEKDAYS_HEIGHT = 28;

/**
 * 주 시작 요일 설정(DR_SETTING.weekStartDow: 0=일, 1=월, 6=토)을 react-calendar의 calendarType으로 옮긴다.
 * calendarType은 요일 배치만 바꾸고 날짜 자체는 항상 양력으로 그린다. (iso8601: 월요일 시작, gregory: 일요일 시작, islamic: 토요일 시작)
 */
export const CALENDAR_TYPE_BY_WEEK_START = { 0: "gregory", 1: "iso8601", 6: "islamic" } as const;


/**
 * 월 그리드(이웃한 달 포함)가 차지하는 주(행) 수. 4 ~ 6.
 * BaseCalendar와 같은 주 시작 설정(Day.getDaysOfWeek)을 따르므로 실제로 렌더링되는 행 수와 일치한다.
 */
export const countCalendarWeeks = (month: Month): number => {
  const offset = Day.getDaysOfWeek().indexOf(month.startDay.dow);
  return Math.ceil((offset + month.startDay.daysInMonth()) / 7);
}


/**
 * 월 그리드가 실제로 그리는 첫 날과 마지막 날(이웃한 달 포함).
 * 주 시작 설정을 따르므로 countCalendarWeeks와 같은 칸 수(주 수 * 7)가 된다.
 */
export const getCalendarGridRange = (month: Month): { startDay: Day; endDay: Day } => {
  const daysOfWeek = Day.getDaysOfWeek();
  const leading = daysOfWeek.indexOf(month.startDay.dow);
  const trailing = 6 - daysOfWeek.indexOf(month.endDay.dow);
  return {
    startDay: month.startDay.clone(m => m.subtract(leading, "day")),
    endDay: month.endDay.clone(m => m.add(trailing, "day")),
  };
}


export type CalendarRowLayout = {
  rowHeight: number;
  // 최소 높이로도 슬라이드에 다 들어가지 않아 슬라이드 안에서 스크롤해야 하는지
  scroll: boolean;
}

/**
 * 슬라이드 높이에서 요일 행과 reserved(요약 행 등)를 뺀 나머지를 주 수로 나눠 행 높이를 정한다.
 * 고정 높이를 쓰면 짧은 창에서 6번째 주가 잘리므로, 월마다 실제 주 수로 나눈다.
 */
export const layoutCalendarRows = ({
  slideHeight,
  rows,
  minRowHeight,
  reserved = 0,
}: {
  slideHeight: number;
  rows: number;
  minRowHeight: number;
  reserved?: number;
}): CalendarRowLayout => {
  const available = slideHeight - reserved - CALENDAR_WEEKDAYS_HEIGHT;
  const rowHeight = Math.floor(available / Math.max(rows, 1));
  if(!Number.isFinite(rowHeight) || rowHeight < minRowHeight){
    return { rowHeight: minRowHeight, scroll: true };
  }
  return { rowHeight, scroll: false };
}
