import { DailyRoutineSettings } from "@/shared/settings";
import { FileSuggest } from "@/shared/suggesters/FileSuggester";
import { useLeaf } from "@/shared/view/use-leaf";
import { saveSettings } from "@/stores/client/use-settings-store";
import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import DailyRoutinePlugin from "src/main";


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
      .addText(textComponent => {
        new FileSuggest(textComponent, "folder")
          .setPlaceholder("daily-routine")
          .setDefaultValue(this.plugin.settings.dailyRoutineFolderPath)
          .onChange((value) => {
            this.updateSettings({ dailyRoutineFolderPath: normalizePath(value) });
          })
      });

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
      });

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
      });

    // Hide Completed Tasks and Routines
    new Setting(containerEl)
      .setName("Hide completed tasks and routines")
      .setDesc("If enabled, completed tasks and routines will not be displayed in the task list.")
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.hideCompletedTasksAndRoutines)
          .onChange((value) => {
            this.updateSettings({ hideCompletedTasksAndRoutines: value });
          })
      });
  }

  // 닫을 때 저장하기 위해서 override
  override hide(): void {
    super.hide();

    saveSettings(this.plugin.settings)
      .then(() => {
        useLeaf.getState().refresh()
      })
  }

  updateSettings(partial: Partial<DailyRoutineSettings>) {
    this.plugin.settings = { ...this.plugin.settings, ...partial };
  }
}