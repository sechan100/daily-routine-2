import { getPlugin } from "@/shared/utils/plugin-service-locator";
import { create } from "zustand";

/**
 * data.json 파일을 불러와서 메모리에 올렸을 때의 타입.
 * 실제 data.json은 사용자 버전에 따라서 다를 수 있지만, 해당 타입은 모든 사용자가 동일해야한다. 
 * 비어있는 값들은 DEFAULT_SETTINGS로 채운다.
 */
export type DailyRoutineSettings = {
  /**
   * daily-routine이 관리하는 폴더 경로
   */
  dailyRoutineFolderPath: string;

  /**
   * 주간 시작일을 월요일로 설정할지 여부
   */
  isMondayStartOfWeek: boolean;

  /**
   * 할 일 체크 해제 시 확인 메시지를 표시할지 여부
   * 실수로 완료한 할 일이 체크 해제되는 것을 방지하기 위함
   */
  confirmUncheckTask: boolean;

  /**
   * 완료된 할 일을 안 보이도록 설정할지 여부
   */
  hideCompletedTasksAndRoutines: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutineSettings = {
  dailyRoutineFolderPath: "daily-routine",
  isMondayStartOfWeek: true,
  confirmUncheckTask: true,
  hideCompletedTasksAndRoutines: false,
}

type SettingsStores = {
  dailyRoutineFolderPath: string;
  routineFolderPath: string;
  routineGroupFolderPath: string;
  noteFolderPath: string;
  taksQueueFilePath: string;
  isMondayStartOfWeek: boolean;
  confirmUncheckTask: boolean;
  hideCompletedTasksAndRoutines: boolean;
}
export const useSettingsStores = create<SettingsStores>(() => ({
  dailyRoutineFolderPath: null as unknown as string,
  routineFolderPath: null as unknown as string,
  routineGroupFolderPath: null as unknown as string,
  noteFolderPath: null as unknown as string,
  taksQueueFilePath: null as unknown as string,
  isMondayStartOfWeek: null as unknown as boolean,
  confirmUncheckTask: null as unknown as boolean,
  hideCompletedTasksAndRoutines: null as unknown as boolean,
}));


export const updateSettingsStores = (newSettings: DailyRoutineSettings) => {
  useSettingsStores.setState({
    dailyRoutineFolderPath: newSettings.dailyRoutineFolderPath,
    routineFolderPath: `${newSettings.dailyRoutineFolderPath}/routines`,
    routineGroupFolderPath: `${newSettings.dailyRoutineFolderPath}/routines/groups`,
    noteFolderPath: `${newSettings.dailyRoutineFolderPath}/notes`,
    taksQueueFilePath: `${newSettings.dailyRoutineFolderPath}/task-queue.md`,
    isMondayStartOfWeek: newSettings.isMondayStartOfWeek,
    confirmUncheckTask: newSettings.confirmUncheckTask,
    hideCompletedTasksAndRoutines: newSettings.hideCompletedTasksAndRoutines,
  });
}

export const saveSettings = async (newSettings: Partial<DailyRoutineSettings>) => {
  const plugin = getPlugin();
  plugin.settings = { ...plugin.settings, ...newSettings };
  await plugin.saveData(plugin.settings);
  updateSettingsStores(plugin.settings);
}