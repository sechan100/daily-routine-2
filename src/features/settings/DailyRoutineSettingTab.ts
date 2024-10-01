import DailyRoutinePlugin from "main";
import { App, normalizePath, Notice, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "./suggesters/FileSuggester";
import { Day } from "lib/day";


export interface DailyRoutinePluginSettings {
  routineFolderPath: string;
  dateFormat: string;
  routineArchiveFolderPath: string;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  routineFolderPath: "daily-routine/routines",
  dateFormat: 'YYYY-MM-DD',
  routineArchiveFolderPath: "daily-routine/archive"
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


    // Routine Note Date Format
    const getDesc = () => {
      const fragment = document.createDocumentFragment();
      const sampleEl = containerEl.createDiv({cls: 'u-pop'});
      fragment.append("The date format of the routine note.");
      fragment.append(sampleEl);
      const updateSample = () => {
        sampleEl.textContent = `Sample: ${Day.now().getAsUserCustomFormat()}`;
      };
      updateSample(); // 초기화
      return {
        fragment,
        updateSample
      };
    }
    const { fragment, updateSample } = getDesc();
    new Setting(containerEl)
    .setName("Routine Note Date Format")
    .setDesc(fragment)
    .addMomentFormat(m => {
      m
      .setPlaceholder("YYYY-MM-DD")
      .setValue(this.plugin.settings.dateFormat??DEFAULT_SETTINGS.dateFormat as string)
      .onChange(async (value) => {
        // 값이 변경되면 설정을 업데이트하고 샘플을 다시 계산
        this.save({ dateFormat: value});
        updateSample();
      });
    });


    // Routine Archive Path
    new Setting(containerEl)
    .setName("Routine Archive Path")
    .setDesc("The path to the routine archive folder.")
    .addText(text => {
      new FileSuggest(text.inputEl, "folder");
      text
      .setPlaceholder("daily-routine/archive")
      .setValue(this.plugin.settings.routineArchiveFolderPath??"")
      .onChange(async (value) => {
        this.save({ routineArchiveFolderPath: normalizePath(value)});
      })
    });
  }


  async save(partial: Partial<DailyRoutinePluginSettings>) {
    const settings = {...this.plugin.settings, ...partial};

    // 루틴폴더와 루틴아카이브폴더의 경로 일치 검사
    if(settings.routineArchiveFolderPath === settings.routineFolderPath){
      new Notice("Routine folder path and routine archive folder path cannot be the same.");
      return;
    }

    this.plugin.settings = {...this.plugin.settings, ...partial};
    await this.plugin.saveSettings();
  }
}