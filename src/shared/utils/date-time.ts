import { moment } from "obsidian";
import { plugin } from "./plugin-service-locator";
import { DEFAULT_SETTINGS } from "src/settings/DailyRoutineSettingTab";


const gerFormat = (): string => {
  const format = plugin().settings.dateFormat;
  if(format && format !== '') {
    return format;
  } else {
    return DEFAULT_SETTINGS.dateFormat as string;
  }
}

export const momentProvider = {

  getDateTime: () => {
    return moment().format(gerFormat());
  },

  // 0, 1, 2, 3, 4, 5, 6
  getDayOfWeekNum: () => {
    return Number(moment().format('d'));
  },
  
  // "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  getDayOfWeek: () => {
    return moment().format('ddd');
  },
  
  isToday: () => {
    return moment().isSame(moment(), 'day');
  } 
}