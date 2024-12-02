import { plugin } from "@shared/plugin-service-locator"



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

  dataFolderPath(){
    return `${s().dailyRoutineFolderPath}/data`;
  },

  isMondayStartOfWeek(){
    return s().isMondayStartOfWeek;
  },
}