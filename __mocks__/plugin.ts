import { DailyRoutinePluginSettings, DEFAULT_SETTINGS } from "@app/settings/DailyRoutineSettingTab";


export const plugin = () => ({
  settings: DEFAULT_SETTINGS
})

export const setPlugin = (_plugin: unknown) => {
  // no-op in tests
}

export const isMobile = () => false;
