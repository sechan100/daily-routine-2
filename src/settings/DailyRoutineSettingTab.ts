import DailyRoutinePlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "./suggesters/FileSuggester";



export interface DailyRoutinePluginSettings {
  routineTemplatePath: string | null;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  routineTemplatePath: null
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

    new Setting(containerEl)
    .setName("Routine Template Path") 
    .setDesc("The path to the daily routine template file.")
    .addText(text => {
        new FileSuggest(text.inputEl, "file");
        text
        .setPlaceholder("daily-routine-template.md")
        .setValue(this.plugin.settings.routineTemplatePath??"")
        .onChange(async (value) => {
          this.plugin.settings.routineTemplatePath = value;
          await this.plugin.saveSettings();
        })
      }
    );
  }
}