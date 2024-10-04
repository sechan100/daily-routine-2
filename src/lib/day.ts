import { moment } from "obsidian";
import { plugin } from "./plugin-service-locator";
import { DEFAULT_SETTINGS } from "features/settings/DailyRoutineSettingTab";


export enum DayOfWeek {
  SUN,
  MON,
  TUE,
  WED,
  THU,
  FRI,
  SAT
}
export const DAY_OF_WEEKS = [DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT];
export const dayOfWeekToString = (dayOfWeek: DayOfWeek) => {
  switch(dayOfWeek) {
    case DayOfWeek.SUN: return 'SUN';
    case DayOfWeek.MON: return 'MON';
    case DayOfWeek.TUE: return 'TUE';
    case DayOfWeek.WED: return 'WED';
    case DayOfWeek.THU: return 'THU';
    case DayOfWeek.FRI: return 'FRI';
    case DayOfWeek.SAT: return 'SAT';
  }
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

  format(format: string){
    return this.#moment.format(format);
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

  isSameDayOfWeek(day: Day){
    return this.getDayOfWeek() === day.getDayOfWeek();
  }

  isSameDayOfWeeks(dayOfWeek: DayOfWeek){
    return this.getDayOfWeek() === dayOfWeek;
  }

}