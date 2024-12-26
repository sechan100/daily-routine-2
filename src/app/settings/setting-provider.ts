import { plugin } from "@shared/utils/plugin-service-locator"



const s = () => {
  return plugin().settings;
}


export const DR_SETTING = {
  routineFolderPath(){
    return `${s().dailyRoutineFolderPath}/routines`;
  },

  noteFolderPath(){
    return `${s().dailyRoutineFolderPath}/notes`;
  },

  isMondayStartOfWeek(){
    return s().isMondayStartOfWeek;
  },

  confirmUncheckTask(){
    return s().confirmUncheckTask;
  }
}