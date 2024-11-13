import DailyRoutinePlugin from "src/main";
import { App, normalizePath, Notice, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "./suggesters/FileSuggester";


export interface DailyRoutinePluginSettings {
  routineFolderPath: string;
  noteFolderPath: string;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  routineFolderPath: "daily-routine/routines",
  noteFolderPath: "daily-routine/archive"
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

    // Routine Folder Path
    new Setting(containerEl)
    .setName("Routine Folder Path") 
    .setDesc("The path to the routine folder.")
    .addText(text => {
      new FileSuggest(text.inputEl, "folder");
      text
      .setPlaceholder("daily-routine/routines")
      .setValue(this.plugin.settings.routineFolderPath??"")
      .onChange(async (value) => {
        this.save({ routineFolderPath: normalizePath(value)});
      })
    })

    // Routine Archive Path
    new Setting(containerEl)
    .setName("Note Archive Path")
    .setDesc("The path to the routine archive folder.")
    .addText(text => {
      new FileSuggest(text.inputEl, "folder");
      text
      .setPlaceholder("daily-routine/archive")
      .setValue(this.plugin.settings.noteFolderPath??"")
      .onChange(async (value) => {
        this.save({ noteFolderPath: normalizePath(value)});
      })
    });
  }


  async save(partial: Partial<DailyRoutinePluginSettings>) {
    const settings = {...this.plugin.settings, ...partial};

    // 루틴폴더와 루틴아카이브폴더의 경로 일치 검사
    if(settings.noteFolderPath === settings.routineFolderPath){
      new Notice("Routine folder path and routine archive folder path cannot be the same.");
      return;
    }

    this.plugin.settings = {...this.plugin.settings, ...partial};
    await this.plugin.saveSettings();
  }
}