import { getPlugin } from "@/app/plugin";
import { DailyRoutineSettings } from "@/shared/settings";
import { create } from "zustand";

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