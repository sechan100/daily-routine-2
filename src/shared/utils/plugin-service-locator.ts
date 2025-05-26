import { Platform } from "obsidian";
import DailyRoutinePlugin from "src/main";

let pluginThisRef: DailyRoutinePlugin | null = null;



export const getPlugin = () => {
  if (pluginThisRef === null) {
    throw new Error('Plugin Service Locator is not initialized');
  }
  return pluginThisRef;
}

export const setPlugin = (plugin: DailyRoutinePlugin) => {
  pluginThisRef = plugin;
}

// @ts-ignore
export const isMobile = () => Platform.isMobile;