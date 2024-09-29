import DailyRoutinePlugin from "main";

let pluginThisRef: DailyRoutinePlugin | null = null;



export const plugin = () => {
  if(pluginThisRef === null) {
    throw new Error('Plugin Service Locator is not initialized');
  }
  return pluginThisRef;
}

export const setPlugin = (plugin: DailyRoutinePlugin) => {
  pluginThisRef = plugin;
}