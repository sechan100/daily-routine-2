import { moment } from "obsidian";
import { plugin } from "../plugin-service-locator";
import _ from "lodash";



export enum DayOfWeek {
  SUN = "SUN",
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT"
}


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

  static now(): Day{
    return new Day(moment());
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
    const isMondayStart = plugin().settings.isMondayStartOfWeek;
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

  getJsDate(){
    return this.#moment.toDate();
  }

  /**
   * 이번주 배열을 반환
   */
  getCurrentWeek(){
    const week = [];
    const m = moment(this.#moment);
    for(let i = 0; i < 7; i++) {
      const day = new Day(m.startOf('week').add(i, 'd'));
      week.push(day);
    }
    return week;
  }

  getDow(): DayOfWeek {  
    const dayOfWeekNum = Number(this.#moment.format('d'));
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
  
  isSameDay(day: Day){
    return this.#moment.isSame(day.#moment, 'day');
  }

  isSameWeek(day: Day){
    return this.#moment.isSame(day.#moment, 'week');
  }

  isSameDow(day: Day | DayOfWeek){
    if(day instanceof Day) {
      return this.getDow() === day.getDow();
    } else {
      return this.getDow() === day;
    }
  }

  daysInMonth(){
    return this.#moment.daysInMonth();
  }
}