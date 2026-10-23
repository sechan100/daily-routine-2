import { formatDayOfWeek } from "@shared/i18n";
import { DayOfWeek } from "@shared/period/day";


export type WeekdayLabelStyle = "short" | "narrow";

const ALL_DAYS_OF_WEEK = [DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];

// 글자 하나가 차지하는 너비를 글꼴 크기의 비율로 어림한 값. 라틴·키릴·아랍 문자 모두 이 정도다. (한글·한자는 짧은 이름이 1~2자라 문제되지 않는다)
const CHAR_WIDTH_EM = 0.6;
// 칸 안쪽 여백(px)
const COLUMN_GUTTER = 4;

/**
 * 요일 이름이 칸 너비에 들어가는지 보고 'short'(월, Mon, Mo)와 'narrow'(한 글자)를 고른다.
 * 아랍어·페르시아어·히브리어처럼 짧은 이름도 긴 언어는 사이드바 너비(~280px)에서 칸을 넘치므로 한 글자 이름으로 바꾼다.
 * react-calendar가 짧은 이름의 '.'을 지우므로 같은 기준으로 센다.
 */
export const pickWeekdayStyle = (shortLabels: string[], columnWidth: number, fontSize = 12): WeekdayLabelStyle => {
  if(!(columnWidth > 0)) return "short";
  const longest = Math.max(...shortLabels.map(label => Array.from(label.replace(".", "")).length));
  return longest * fontSize * CHAR_WIDTH_EM > columnWidth - COLUMN_GUTTER ? "narrow" : "short";
}

/** 지금 언어에서 일주일의 짧은 요일 이름 전체. 칸 너비 판단에 쓴다. */
export const allShortWeekdayLabels = (): string[] => {
  return ALL_DAYS_OF_WEEK.map(dow => formatDayOfWeek(dow, "short"));
}
