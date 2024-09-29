import DailyRoutinePlugin from "main";
import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import { FileSuggest } from "./suggesters/FileSuggester";
import { Day } from "lib/day";


export interface DailyRoutinePluginSettings {
  routineFolderPath: string | null;
  dateFormat: string | null;
}

export const DEFAULT_SETTINGS: DailyRoutinePluginSettings = {
  routineFolderPath: null,
  dateFormat: 'YYYY-MM-DD'
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
      .setPlaceholder("ex) /routine/folder")
      .setValue(this.plugin.settings.routineFolderPath??"")
      .onChange(async (value) => {
        this.plugin.settings.routineFolderPath = normalizePath(value);
        await this.plugin.saveSettings();
      })
    })


    // Routine Note Date Format
    const getDesc = () => {
      const fragment = document.createDocumentFragment();
      const sampleEl = containerEl.createDiv({cls: 'u-pop'});
      fragment.append("The date format of the routine note.");
      fragment.append(sampleEl);
      const updateSample = () => {
        sampleEl.textContent = `Sample: ${Day.fromNow().getAsUserCustomFormat()}`;
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
        this.plugin.settings.dateFormat = value;
        await this.plugin.saveSettings();
        updateSample();
      });
    });
  }
}