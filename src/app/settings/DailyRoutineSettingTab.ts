import DailyRoutinePlugin from "src/main";
import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "@shared/suggesters/FileSuggester";
import { useLeaf } from "@shared/view/use-leaf";


export interface DailyRoutinePluginSettings {
  dailyRoutineFolderPath: string;
  isMondayStartOfWeek: boolean;
  confirmUncheckTask: boolean;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  dailyRoutineFolderPath: "daily_routine",
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
    .setDesc("This is the path to the folder where the daily routine plugin saves notes, routines, and other data.")
    .addText(textComponent => {
      new FileSuggest(textComponent, "folder")
      .setPlaceholder("Daily_routine")
      .setDefaultValue(this.plugin.settings.dailyRoutineFolderPath??"")
      .onChange((value) => {
        this.updateSettings({ dailyRoutineFolderPath: normalizePath(value)});
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
      .onChange((value) => {
        const isMondayStartOfWeek = value === "monday";
        this.updateSettings({ isMondayStartOfWeek });
      })
    })

    // Confirm Uncheck Task
    new Setting(containerEl)
    .setName("Do confirmation when unchecking task")
    .setDesc("When you uncheck a task, a confirmation dialog will appear.")
    .addToggle(toggle => {
      toggle
      .setValue(this.plugin.settings.confirmUncheckTask)
      .onChange((value) => {
        this.updateSettings({ confirmUncheckTask: value });
      })
    })
  }

  // 닫을 때 view를 새로고침하기 위해서 override
  override hide(): void {
    super.hide();

    // view가 한 번도 마운트되지 않았다면 getState가 존재하지 않는다
    if(typeof useLeaf.getState === "function") {
      useLeaf.getState().refresh();
    }
  }

  updateSettings(partial: Partial<DailyRoutinePluginSettings>) {
    this.plugin.settings = {...this.plugin.settings, ...partial};
    void this.plugin.saveSettings();
  }
}