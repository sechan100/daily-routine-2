import { moment } from "obsidian";
import { plugin } from "./plugin-service-locator";



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
  #moment: moment.Moment;
  static defaultFormat = 'YYYY-MM-DD';

  /**
   * 
   * @param day "YYYY-MM-DD" 형식의 문자열
   */ 
  constructor(_moment: moment.Moment) {
    const m = moment(_moment);
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

  static getDaysOfWeek(): DayOfWeek[] {
    const weekWithoutSun = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];
    const isMondayStart = plugin().settings.isMondayStartOfWeek;
    return isMondayStart ? [...weekWithoutSun, DayOfWeek.SUN] : [DayOfWeek.SUN, ...weekWithoutSun];
  }

  format(format: string){
    return this.#moment.format(format);
  }

  isToday(){
    return this.#moment.isSame(moment(), 'day');
  }

  isBefore(day: Day){
    return this.#moment.isBefore(day.#moment);
  }

  isAfter(day: Day){
    return this.#moment.isAfter(day.#moment);
  }

  isBetween(start: Day, end: Day, unit?: moment.unitOfTime.StartOf, inclusivity?: "()" | "[)" | "(]" | "[]"){
    return this.#moment.isBetween(start.#moment, end.#moment, unit, inclusivity);
  }

  add(amount: number, unit: moment.unitOfTime.DurationConstructor){
    return new Day(this.#moment.clone().add(amount, unit));
  }

  subtract(amount: number, unit: moment.unitOfTime.DurationConstructor){
    return new Day(this.#moment.clone().subtract(amount, unit));
  }

  clone(cb?: (cloneMoment: moment.Moment) => void){
    const cloneMoment = this.#moment.clone();
    if(cb) cb(cloneMoment);
    return new Day(cloneMoment);
  }

  getDate(){
    return this.#moment.date();
  }

  getJsDate(){
    return this.#moment.toDate();
  }

  get moment(){
    return this.#moment;
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

  getBaseFormat(){
    return this.#moment.format(Day.defaultFormat);
  }

  getDayOfWeek(): DayOfWeek {  
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

  isSameDayOfWeek(day: Day | DayOfWeek){
    if(day instanceof Day) {
      return this.getDayOfWeek() === day.getDayOfWeek();
    } else {
      return this.getDayOfWeek() === day;
    }
  }
}