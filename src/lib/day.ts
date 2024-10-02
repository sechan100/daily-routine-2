import { moment } from "obsidian";
import { plugin } from "./plugin-service-locator";
import { DEFAULT_SETTINGS } from "features/settings/DailyRoutineSettingTab";


export enum DayOfWeek {
  SUN,
  MON,
  TUE,
  WEN,
  THU,
  FRI,
  SAT
}

export class Day {
  moment: moment.Moment;
  static defaultFormat = 'YYYY-MM-DD';

  /**
   * 
   * @param day "YYYY-MM-DD" 형식의 문자열
   */
  constructor(_moment: moment.Moment) {
    const m = moment(_moment);
    if(m.isValid()) {
      this.moment = m;
    } else {
      throw new Error(`Invalid date format. ${_moment.toString()}`);
    }
  }


  static now(): Day{
    return new Day(moment());
  }

  format(format: string){
    return this.moment.format(format);
  }

  /**
   * 이번주 배열을 반환
   */
  getCurrentWeek(){
    const week = [];
    const m = moment(this.moment);
    for(let i = 0; i < 7; i++) {
      const day = new Day(m.startOf('week').add(i, 'd'));
      week.push(day);
    }
    return week;
  }

  getAsUserCustomFormat(){
    return this.moment.format(gerFormat());
  }

  getAsDefaultFormat(){
    return this.moment.format(Day.defaultFormat);
  }

  getDayOfWeek(): DayOfWeek {  
    const dayOfWeekNum = Number(moment().format('d'));
    switch(dayOfWeekNum) {
      case 0: return DayOfWeek.SUN;
      case 1: return DayOfWeek.MON;
      case 2: return DayOfWeek.TUE;
      case 3: return DayOfWeek.WEN;
      case 4: return DayOfWeek.THU;
      case 5: return DayOfWeek.FRI;
      case 6: return DayOfWeek.SAT;
      default: throw new Error('Invalid day of week number.');
    }
  }
  
  isSameDay(day: Day){
    return this.moment.isSame(day.moment, 'day');
  }

  isSameDayOfWeek(day: Day){
    return this.getDayOfWeek() === day.getDayOfWeek();
  }

  isSameDayOfWeeks(dayOfWeek: DayOfWeek){
    return this.getDayOfWeek() === dayOfWeek;
  }

}


/**
 * 사용자가 설정한 날짜 포맷을 가져온다.
 */
const gerFormat = (): string => {
  const format = plugin().settings.dateFormat;
  if(format && format !== '') {
    return format;
  } else {
    return DEFAULT_SETTINGS.dateFormat as string;
  }
}