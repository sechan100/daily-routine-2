import { Day, DayOfWeek } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { getDateLocale } from "./language";


/**
 * 화면에 보여줄 날짜·숫자 포매터. Obsidian 언어(getDateLocale)를 따르며, 항상 양력으로 표기한다.
 * 저장용 값(노트 파일 이름 등)에는 쓰지 않는다. 저장용은 Day.format()이다.
 */

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatter = (options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
  const locale = getDateLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if(!formatter){
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toLocaleUpperCase(getDateLocale()) + text.slice(1);
}


/** 주간 표시줄 등에 쓰는 짧은 월/일. en "10/23", ko "10. 23.", de "23.10." */
export const formatMonthDayNumeric = (day: Day): string => {
  return dateFormatter({ month: "numeric", day: "numeric" }).format(day.getJsDate());
}

/** 짧은 요일 이름. en "Fri", ko "금", de "Fr." */
export const formatWeekdayShort = (day: Day): string => {
  return dateFormatter({ weekday: "short" }).format(day.getJsDate());
}

/** 노트 화면 헤더의 날짜. en "Fri, Oct 23", ko "10월 23일 (금)". withYear면 연도를 붙인다. */
export const formatHeaderDate = (day: Day, withYear: boolean): string => {
  return dateFormatter({
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(day.getJsDate());
}

/** 연·월·일을 모두 담은 날짜(알림·확인창 문구용). en "Oct 23, 2026", ko "2026년 10월 23일" */
export const formatFullDate = (day: Day): string => {
  return dateFormatter({ year: "numeric", month: "short", day: "numeric" }).format(day.getJsDate());
}

/** 달력 제목의 연·월. en "October 2026", ko "2026년 10월" */
export const formatMonthYear = (month: Month): string => {
  return dateFormatter({ year: "numeric", month: "long" }).format(month.startDay.getJsDate());
}

/** 그 달의 날짜 숫자만. 아랍어 등은 그 언어의 숫자로 쓴다. (ko "23일", ja "23日"처럼 붙는 접미사는 뺀다) */
export const formatDayOfMonth = (day: Day): string => {
  const parts = dateFormatter({ day: "numeric" }).formatToParts(day.getJsDate());
  return parts.find(part => part.type === "day")?.value ?? String(day.date);
}

// 2023-01-01은 일요일이다. 요일 이름은 이 주의 날짜로부터 만든다.
const SUNDAY_FIRST: DayOfWeek[] = [DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];

/** 요일(DayOfWeek) 이름. style은 Intl의 weekday 옵션과 같다. */
export const formatDayOfWeek = (dow: DayOfWeek, style: "long" | "short" | "narrow" = "short"): string => {
  const date = new Date(2023, 0, 1 + SUNDAY_FIRST.indexOf(dow));
  return dateFormatter({ weekday: style }).format(date);
}

/**
 * 오늘을 기준으로 한 상대 날짜. en "Today"/"Yesterday"/"In 3 days", ko "오늘"/"어제"/"3일 후"
 */
export const formatRelativeDay = (day: Day, today: Day): string => {
  const diff = day.wholeDayDiff(today);
  try {
    const formatter = new Intl.RelativeTimeFormat(getDateLocale(), { numeric: "auto" });
    return capitalizeFirst(formatter.format(diff, "day"));
  } catch {
    return String(diff);
  }
}

const numberFormatters = new Map<string, Intl.NumberFormat>();
const numberFormatter = (options: Intl.NumberFormatOptions): Intl.NumberFormat => {
  const locale = getDateLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);
  if(!formatter){
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

/** 0~1 비율을 백분율로. en "67%", ar "٦٧٪" */
export const formatPercent = (ratio: number): string => {
  return numberFormatter({ style: "percent", maximumFractionDigits: 0 }).format(ratio);
}

/** 정수·소수를 그 언어의 숫자로. */
export const formatNumber = (value: number): string => {
  return numberFormatter({}).format(value);
}
