import DailyRoutinePlugin from "src/main";
import { App, normalizePath, Notice, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "@shared/suggesters/FileSuggester";
import { useLeaf } from "@shared/view/use-leaf";


export interface DailyRoutinePluginSettings {
  dailyRoutineFolderPath: string;
  isMondayStartOfWeek: boolean;
  confirmUncheckTask: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  dailyRoutineFolderPath: "DAILY_ROUTINE",
  isMondayStartOfWeek: true,
  confirmUncheckTask: true
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

    // DAILY ROUTINE FOLDER PATH
    new Setting(containerEl)
    .setName("Daily routine folder path") 
    .setDesc("This is the path to the folder where the Daily Routine Plugin saves notes, routines, and other data.")
    .addText(text => {
      new FileSuggest(text.inputEl, "folder");
      text
      .setPlaceholder("DAILY_ROUTINE")
      .setValue(this.plugin.settings.dailyRoutineFolderPath??"")
      .onChange(async (value) => {
        this.save({ dailyRoutineFolderPath: normalizePath(value)});
      })
    })

    // Start of Week
    new Setting(containerEl)
    .setName("Start of week")
    .setDesc("Set the start of the week on the top of note view.")
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
      })
    })

    // Confirm Uncheck Task
    new Setting(containerEl)
    .setName("Do confirmation when unchecking task")
    .setDesc("When you uncheck a task, a confirmation dialog will appear.")
    .addToggle(toggle => {
      toggle
      .setValue(this.plugin.settings.confirmUncheckTask)
      .onChange(async (value) => {
        this.save({ confirmUncheckTask: value });
      })
    })
  }


  async save(partial: Partial<DailyRoutinePluginSettings>) {
    const settings = {...this.plugin.settings, ...partial};
    this.plugin.settings = {...this.plugin.settings, ...partial};
    await this.plugin.saveSettings();
    useLeaf.getState().refresh();
  }
}