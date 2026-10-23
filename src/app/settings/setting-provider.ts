import { plugin } from "@shared/utils/plugin-service-locator"
import { resolveFolderPath } from "./folder-path";



const s = () => {
  return plugin().settings;
}


export const DR_SETTING = {
  routineFolderPath(){
    return `${resolveFolderPath(s().dailyRoutineFolderPath)}/routines`;
  },

  noteFolderPath(){
    return `${resolveFolderPath(s().dailyRoutineFolderPath)}/notes`;
  },

  /**
   * 주의 첫 요일. moment의 day() 값(0=일요일, 1=월요일, 6=토요일)으로 돌려준다.
   */
  weekStartDow(): 0 | 1 | 6 {
    switch(s().weekStart){
      case "sunday": return 0;
      case "saturday": return 6;
      default: return 1;
    }
  },

  confirmUncheckTask(){
    return s().confirmUncheckTask;
  },

  defaultRoutineShowOnCalendar(){
    return s().defaultRoutineShowOnCalendar;
  },

  defaultTodoShowOnCalendar(){
    return s().defaultTodoShowOnCalendar;
  }
}