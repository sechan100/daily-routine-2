import DailyRoutinePlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";




// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DailyRoutinePluginSettings {
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
}




export class DailyRoutineSettingTab extends PluginSettingTab {
  plugin: DailyRoutinePlugin;

  constructor(app: App, plugin: DailyRoutinePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
  }
}