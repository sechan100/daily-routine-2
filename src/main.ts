import { Plugin } from 'obsidian';
import { setPlugin } from './shared/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from './settings/DailyRoutineSettingTab';
import { DailyRoutineObsidianView } from './app';
import { activateView } from './shared/view/activate-view';
import { openRoutineOptionModal } from 'features/routine';
import { routineManager } from 'entities/routine';

export default class DailyRoutinePlugin extends Plugin {
	settings: DailyRoutinePluginSettings;

	async onload() {
		await this.loadSettings();

    // plugin locator 설정
    setPlugin(this);

    // setting tab
    this.addSettingTab(new DailyRoutineSettingTab(this.app, this));

    this.registerView(
      DailyRoutineObsidianView.VIEW_TYPE,
      (leaf) => new DailyRoutineObsidianView(leaf)
    );

    this.addRibbonIcon("dice", "Routine View", () => {
      activateView(DailyRoutineObsidianView.VIEW_TYPE);
    });

    this.addRibbonIcon("ribbon", "Mobile Toggle", () => {
      // @ts-ignore
      this.app.emulateMobile(!this.app.isMobile);
    });

    setTimeout(async() => {
      openRoutineOptionModal(await routineManager.get("🖊️ 공식문서 작성"));
    }, 100);
  }
  
  onunload() {
  }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

  async saveSettings() {
    await this.saveData(this.settings);
  }
}