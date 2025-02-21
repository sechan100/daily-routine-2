import { moment as obsidianMoment } from "obsidian";
import _ from "lodash";
import { DR_SETTING } from "@app/settings/setting-provider";



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
const moment = obsidianMoment as unknown as (inp?: moment.MomentInput) => moment.Moment;

export type DayFormat = ReturnType<Day['format']>;

export class Day {
  readonly #moment: moment.Moment;

  /**
   * 
   * @param day "YYYY-MM-DD" 형식의 문자열
   */ 
  constructor(_moment: moment.Moment) {
    const m = _moment.clone();
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
    return new Day(moment('9999-12-31T23:59:59.999Z'));
  }

  static fromString(str: string){
    return new Day(moment(str));
  }

  static fromJsDate(date: Date){
    return new Day(moment(date));
  }

  static getDaysOfWeek(): DayOfWeek[] {
    const weekWithoutSun = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];
    const isMondayStart = DR_SETTING.isMondayStartOfWeek();
    return isMondayStart ? [...weekWithoutSun, DayOfWeek.SUN] : [DayOfWeek.SUN, ...weekWithoutSun];
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
    return this.#moment.week();
  }

  get date(){
    return this.#moment.date();
  }

  get dow(): DayOfWeek {  
    const dayOfWeekNum = this.#moment.format('ddd');
    switch(dayOfWeekNum) {
      case "Sun": return DayOfWeek.SUN;
      case "Mon": return DayOfWeek.MON;
      case "Tue": return DayOfWeek.TUE;
      case "Wed": return DayOfWeek.WED;
      case "Thu": return DayOfWeek.THU;
      case "Fri": return DayOfWeek.FRI;
      case "Sat": return DayOfWeek.SAT;
      default: throw new Error('Invalid day of week number.');
    }
  }

  getJsDate(){
    return this.#moment.toDate();
  }
  
  isSameDay(day: Day){
    return this.#moment.isSame(day.#moment, 'day');
  }

  isSameMonth(day: Day){
    return this.#moment.isSame(day.#moment, 'month');
  }

  isSameWeek(day: Day){
    return this.#moment.isSame(day.#moment, 'week');
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