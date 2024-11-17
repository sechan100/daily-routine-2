import DailyRoutinePlugin from "src/main";
import { App, normalizePath, Notice, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "@shared/suggesters/FileSuggester";
import { updateMomentConfig } from "./moment-config";
import { useDrLeaf } from "@shared/view/react-view";


export interface DailyRoutinePluginSettings {
  routineFolderPath: string;
  noteFolderPath: string;
  isMondayStartOfWeek: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  routineFolderPath: "daily-routine/routines",
  noteFolderPath: "daily-routine/archive",
  isMondayStartOfWeek: true
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

    // Routine Note Folder Path
    new Setting(containerEl)
    .setName("Routine Note Archive Path")
    .setDesc("The path to the routine note archive folder.")
    .addText(text => {
      new FileSuggest(text.inputEl, "folder");
      text
      .setPlaceholder("daily-routine/archive")
      .setValue(this.plugin.settings.noteFolderPath??"")
      .onChange(async (value) => {
        this.save({ noteFolderPath: normalizePath(value)});
      })
    });

    // Start of Week
    new Setting(containerEl)
    .setName("Start of Week")
    .setDesc("Set the start of the week.")
    .addDropdown(dropdown => {
      dropdown
      .addOptions({
        "monday": "Monday",
        "sunday": "Sunday"
      })
      .setValue(this.plugin.settings.isMondayStartOfWeek ? "monday" : "sunday")
      .onChange(async (value) => {
        const isMondayStartOfWeek = value === "monday";
        this.save({ isMondayStartOfWeek });
        updateMomentConfig({ isMondayStartOfWeek })
      })
    })
  }


  async save(partial: Partial<DailyRoutinePluginSettings>) {
    const settings = {...this.plugin.settings, ...partial};

    if(settings.noteFolderPath === settings.routineFolderPath){
      new Notice("Routine folder path and routine archive folder path cannot be the same.");
      return;
    }

    this.plugin.settings = {...this.plugin.settings, ...partial};
    await this.plugin.saveSettings();
    useDrLeaf.getState().refresh();
  }
}