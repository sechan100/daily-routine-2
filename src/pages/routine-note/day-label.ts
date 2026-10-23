import { formatHeaderDate, formatRelativeDay } from "@shared/i18n";
import { Day } from "@shared/period/day";


/**
 * 오늘을 기준으로 한 상대 날짜 표기. ex) en "Today", "Yesterday", "3 days ago" / ko "오늘", "어제", "3일 전"
 */
export const relativeDayLabel = (day: Day, today: Day): string => {
  return formatRelativeDay(day, today);
}

/**
 * 노트 헤더의 날짜 표기. 올해가 아닌 날짜에만 연도를 붙인다. ex) en "Fri, Oct 23", "Tue, Sep 30, 2025" / ko "10월 23일 (금)", "2025년 9월 30일 (화)"
 */
export const noteDateLabel = (day: Day, today: Day): string => {
  return formatHeaderDate(day, day.year !== today.year);
}
