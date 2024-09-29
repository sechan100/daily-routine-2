import { moment } from "obsidian";
import { plugin } from "./plugin-service-locator";
import { DEFAULT_SETTINGS } from "settings/DailyRoutineSettingTab";


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
  constructor(day: string) {
    const m = moment(day);
    if(m.isValid()) {
      this.moment = m;
    } else {
      throw new Error(`Invalid date format. ${day}`);
    }
  }

  static fromNow(): Day{
    return new Day(moment().format(Day.defaultFormat));
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
    return this.moment.isSame(day.moment);
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