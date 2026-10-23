import { moment as obsidianMoment } from "obsidian";
import { DR_SETTING } from "@app/settings/setting-provider";
import { toAsciiDigits } from "./ascii-digits";



export enum DayOfWeek {
  SUN = "SUN",
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT"
}

// HACK: obsidian.d.ts에서 typeof 로 선언된 Moment가 호출될 수 없다고 에러가 발생함.
const moment = obsidianMoment as unknown as {
  (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): moment.Moment;
  (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment;
};

/**
 * 로케일이 아닌 플러그인 설정(weekStart)에 따른 주 시작일로 moment를 이동시킨다.
 */
const moveToStartOfSettingWeek = (m: moment.Moment): moment.Moment => {
  const weekStartDow = DR_SETTING.weekStartDow(); // 0=SUN, 1=MON, 6=SAT
  const diff = (m.day() - weekStartDow + 7) % 7;
  return m.subtract(diff, "day").startOf("day");
}

export type DayFormat = ReturnType<Day['format']>;

export class Day {
  readonly #moment: moment.Moment;

  /**
   * 
   * @param day "YYYY-MM-DD" 형식의 문자열
   */ 
  constructor(_moment: moment.Moment) {
    // Obsidian은 moment의 전역 로케일을 앱 언어로 바꾼다. 아랍어·페르시아어·힌디어 등은 format()이 그 언어의 숫자를 쓰므로
    // ('٢٠٢٦-١٠-٢٣') 노트 파일 이름 같은 저장 값이 깨진다. Day는 항상 영어 로케일로 다루고, 화면 표시는 @shared/i18n의 포매터를 쓴다.
    const m = _moment.clone().locale('en');
    if(m.isValid()) {
      this.#moment = m;
    } else {
      throw new Error(`Invalid date format. ${_moment.toString()}`);
    }
  }

  static today(): Day{
    return new Day(moment());
  }

  static tomorrow(): Day {
    return new Day(moment().add(1, 'day'));
  }

  static max(): Day{
    return Day.fromString('9999-12-31');
  }

  static fromString(str: string){
    // 저장된 값은 로케일과 무관한 'YYYY-MM-DD'이므로 영어 로케일로 읽는다.
    // 이전 버전이 앱 언어의 숫자('٢٠٢٦-١٠-٢٣')로 저장한 값도 아라비아 숫자로 바꿔 읽는다.
    const ascii = toAsciiDigits(str);
    if(/^\d{4}-\d{2}-\d{2}$/.test(ascii)) return new Day(moment(ascii, 'YYYY-MM-DD', 'en', true));
    return new Day(moment(ascii));
  }

  static fromJsDate(date: Date){
    return new Day(moment(date));
  }

  /**
   * "YYYY-MM-DD" 형식의 유효한 날짜 문자열인지 검사한다.
   */
  static isValidFormat(str: string): boolean {
    return moment(toAsciiDigits(str), 'YYYY-MM-DD', 'en', true).isValid();
  }

  /**
   * 설정된 주 시작 요일부터 순서대로 7개 요일을 돌려준다.
   */
  static getDaysOfWeek(): DayOfWeek[] {
    const sundayFirst = [DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];
    const start = DR_SETTING.weekStartDow();
    return [...sundayFirst.slice(start), ...sundayFirst.slice(0, start)];
  }

  format(format?: string){
    return this.#moment.format(format ? format : 'YYYY-MM-DD');
  }

  isToday(){
    return this.#moment.isSame(moment(), 'day');
  }

  isBefore(day: Day){
    return this.#moment.isBefore(day.#moment);
  }

  isSameOrBefore(day: Day){
    return this.#moment.isSameOrBefore(day.#moment);
  }

  isAfter(day: Day){
    return this.#moment.isAfter(day.#moment);
  }

  isSameOrAfter(day: Day){
    return this.#moment.isSameOrAfter(day.#moment);
  }

  isBetween(start: Day, end: Day, unit?: moment.unitOfTime.StartOf, inclusivity?: "()" | "[)" | "(]" | "[]"){
    return this.#moment.isBetween(start.#moment, end.#moment, unit, inclusivity);
  }

  clone(cb?: (cloneMoment: moment.Moment) => void){
    const cloneMoment = this.#moment.clone();
    if(cb) cb(cloneMoment);
    return new Day(cloneMoment);
  }

  get year(){
    return this.#moment.year();
  }

  get month(){
    return this.#moment.month() + 1;
  }

  get week(){
    // 주차 계산이 로케일에 좌우되지 않도록, 설정된 주 시작 요일 기준으로 계산한다.
    // 월요일 시작은 ISO 주차, 일요일 시작은 미국식 주차다. 토요일 시작도 같은 규칙(1월 1일이 든 주가 1주차)으로 센다.
    const start = DR_SETTING.weekStartDow();
    if(start === 1) return this.#moment.isoWeek();
    if(start === 0) return this.#moment.clone().locale("en").week();
    const weekStart = moveToStartOfSettingWeek(this.#moment.clone());
    const weekEnd = weekStart.clone().add(6, 'day');
    const firstWeekStart = moveToStartOfSettingWeek(moment([weekEnd.year(), 0, 1]).locale('en'));
    return weekStart.diff(firstWeekStart, 'week') + 1;
  }

  get date(){
    return this.#moment.date();
  }

  get dow(): DayOfWeek {
    // moment.day()는 로케일과 무관하게 항상 0=일요일 ~ 6=토요일을 반환한다.
    const dayOfWeekNum = this.#moment.day();
    switch(dayOfWeekNum) {
      case 0: return DayOfWeek.SUN;
      case 1: return DayOfWeek.MON;
      case 2: return DayOfWeek.TUE;
      case 3: return DayOfWeek.WED;
      case 4: return DayOfWeek.THU;
      case 5: return DayOfWeek.FRI;
      case 6: return DayOfWeek.SAT;
      default: throw new Error('Invalid day of week number.');
    }
  }

  getJsDate(){
    return this.#moment.toDate();
  }
  
  isSameDay(day: Day){
    return this.#moment.isSame(day.#moment, 'day');
  }

  /**
   * day 단위로 (this - day)의 차이를 반환한다. 시각(time-of-day)은 무시한다.
   */
  wholeDayDiff(day: Day): number {
    return this.#moment.clone().startOf('day').diff(day.#moment.clone().startOf('day'), 'day');
  }

  isSameMonth(day: Day){
    return this.#moment.isSame(day.#moment, 'month');
  }

  isSameWeek(day: Day){
    // 로케일의 'week' 단위 대신 설정된 주 시작 요일을 기준으로 비교한다.
    return moveToStartOfSettingWeek(this.#moment.clone())
      .isSame(moveToStartOfSettingWeek(day.#moment.clone()), 'day');
  }

  isSameDow(day: Day | DayOfWeek){
    if(day instanceof Day) {
      return this.dow === day.dow;
    } else {
      return this.dow === day;
    }
  }

  // FIXME: 이건 Month에 있어야 맞지않냐
  daysInMonth(){
    return this.#moment.daysInMonth();
  }
}