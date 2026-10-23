import { DEFAULT_FOLDER_PATH } from "./folder-path";


export type WeekStart = "monday" | "sunday" | "saturday";

export interface DailyRoutinePluginSettings {
  dailyRoutineFolderPath: string;
  weekStart: WeekStart;
  // 이전 버전과의 호환을 위해 남겨둔다. 읽을 때는 weekStart가 없을 때만 쓰고, 저장할 때는 weekStart와 맞춰 둔다.
  isMondayStartOfWeek: boolean;
  confirmUncheckTask: boolean;
  defaultRoutineShowOnCalendar: boolean;
  defaultTodoShowOnCalendar: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  dailyRoutineFolderPath: DEFAULT_FOLDER_PATH,
  weekStart: "monday",
  isMondayStartOfWeek: true,
  confirmUncheckTask: true,
  defaultRoutineShowOnCalendar: false,
  defaultTodoShowOnCalendar: true
}


export const toWeekStart = (value: unknown): WeekStart => {
  return value === "sunday" || value === "saturday" ? value : "monday";
}

/**
 * 저장된 설정을 읽는다. weekStart가 없는 이전 버전의 설정은 isMondayStartOfWeek로부터 정한다.
 */
export const migrateSettings = (data: unknown): DailyRoutinePluginSettings => {
  const stored = (typeof data === "object" && data !== null ? data : {}) as Partial<DailyRoutinePluginSettings>;
  const weekStart = stored.weekStart !== undefined
    ? toWeekStart(stored.weekStart)
    : (stored.isMondayStartOfWeek === false ? "sunday" : "monday");
  return { ...DEFAULT_SETTINGS, ...stored, weekStart, isMondayStartOfWeek: weekStart === "monday" };
}
