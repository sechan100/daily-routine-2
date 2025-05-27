import { getPlugin } from "@/shared/utils/plugin-service-locator";

/**
 * data.json 파일을 불러와서 메모리에 올렸을 때의 타입.
 * 실제 data.json은 사용자 버전에 따라서 다를 수 있지만, 해당 타입은 모든 사용자가 동일해야한다. 
 * 비어있는 값들은 DEFAULT_SETTINGS로 채운다.
 */
export type DailyRoutineSettings = {
  dailyRoutineFolderPath: string;
  isMondayStartOfWeek: boolean;
  confirmUncheckTask: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutineSettings = {
  dailyRoutineFolderPath: "daily_routine",
  isMondayStartOfWeek: true,
  confirmUncheckTask: true
}

export const SETTINGS = {
  getDailyRoutineFolderPath() {
    return getPlugin().settings.dailyRoutineFolderPath;
  },

  getRoutineFolderPath() {
    return `${getPlugin().settings.dailyRoutineFolderPath}/routines`;
  },

  getRoutineGroupFolderPath() {
    return `${getPlugin().settings.dailyRoutineFolderPath}/routines/groups`;
  },

  getNoteFolderPath() {
    return `${getPlugin().settings.dailyRoutineFolderPath}/notes`;
  },

  getIsMondayStartOfWeek() {
    return getPlugin().settings.isMondayStartOfWeek;
  },

  getConfirmUncheckTask() {
    return getPlugin().settings.confirmUncheckTask;
  }
}