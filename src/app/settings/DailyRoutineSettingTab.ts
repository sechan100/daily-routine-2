import DailyRoutinePlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { t } from "@shared/i18n";
import { FileSuggest } from "@shared/suggesters/FileSuggester";
import { useLeaf } from "@shared/view/use-leaf";
import { toFolderPathSetting } from "./folder-path";
import { DailyRoutinePluginSettings, toWeekStart, WeekStart } from "./settings";

export { DEFAULT_SETTINGS, migrateSettings } from "./settings";
export type { DailyRoutinePluginSettings, WeekStart } from "./settings";


// 바뀌면 뷰를 다시 그려야 하는 설정. 폴더 경로는 읽어올 노트를, 주 시작 요일은 주간 바와 달력의 배치를 바꾼다.
// 나머지 설정은 쓰이는 시점에 매번 읽으므로 다시 그릴 필요가 없다.
const RENDER_AFFECTING_SETTINGS = ["dailyRoutineFolderPath", "weekStart"] as const;


export class DailyRoutineSettingTab extends PluginSettingTab {
  plugin: DailyRoutinePlugin;
  // 설정 탭을 열었을 때의 설정. 닫을 때 비교해서 다시 그릴지 정한다.
  private settingsOnDisplay: DailyRoutinePluginSettings | null = null;

  constructor(app: App, plugin: DailyRoutinePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    this.settingsOnDisplay = { ...this.plugin.settings };

    // DAILY ROUTINE FOLDER PATH
    new Setting(containerEl)
    .setName(t("shell.settings.folderPath.name"))
    .setDesc(t("shell.settings.folderPath.desc"))
    .addText(textComponent => {
      new FileSuggest(textComponent, "folder")
      .setPlaceholder("Daily_routine")
      .setDefaultValue(this.plugin.settings.dailyRoutineFolderPath??"")
      .onChange((value) => {
        this.updateSettings({ dailyRoutineFolderPath: toFolderPathSetting(value) });
      })
    })

    // Start of Week
    new Setting(containerEl)
    .setName(t("shell.settings.weekStart.name"))
    .setDesc(t("shell.settings.weekStart.desc"))
    .addDropdown(dropdown => {
      dropdown
      .addOptions({
        "monday": t("shell.settings.weekStart.monday"),
        "sunday": t("shell.settings.weekStart.sunday"),
        "saturday": t("shell.settings.weekStart.saturday"),
      } satisfies Record<WeekStart, string>)
      .setValue(this.plugin.settings.weekStart)
      .onChange((value) => {
        const weekStart = toWeekStart(value);
        this.updateSettings({ weekStart, isMondayStartOfWeek: weekStart === "monday" });
      })
    })

    // Confirm Uncheck Task
    new Setting(containerEl)
    .setName(t("shell.settings.confirmUncheck.name"))
    .setDesc(t("shell.settings.confirmUncheck.desc"))
    .addToggle(toggle => {
      toggle
      .setValue(this.plugin.settings.confirmUncheckTask)
      .onChange((value) => {
        this.updateSettings({ confirmUncheckTask: value });
      })
    })

    // Default 'Show on calendar' for new routines
    new Setting(containerEl)
    .setName(t("shell.settings.routineOnCalendar.name"))
    .setDesc(t("shell.settings.routineOnCalendar.desc"))
    .addToggle(toggle => {
      toggle
      .setValue(this.plugin.settings.defaultRoutineShowOnCalendar)
      .onChange((value) => {
        this.updateSettings({ defaultRoutineShowOnCalendar: value });
      })
    })

    // Default 'Show on calendar' for new todos
    new Setting(containerEl)
    .setName(t("shell.settings.todoOnCalendar.name"))
    .setDesc(t("shell.settings.todoOnCalendar.desc"))
    .addToggle(toggle => {
      toggle
      .setValue(this.plugin.settings.defaultTodoShowOnCalendar)
      .onChange((value) => {
        this.updateSettings({ defaultTodoShowOnCalendar: value });
      })
    })
  }

  // 화면에 영향을 주는 설정이 바뀌었을 때만 닫으면서 view를 새로고침하기 위해서 override
  override hide(): void {
    super.hide();

    const before = this.settingsOnDisplay;
    this.settingsOnDisplay = null;
    const after = this.plugin.settings;
    if(!before || RENDER_AFFECTING_SETTINGS.every(key => before[key] === after[key])) return;

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