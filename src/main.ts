import { Plugin } from 'obsidian';
import { setPlugin } from './shared/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from './settings/DailyRoutineSettingTab';
import { DailyRoutineObsidianView } from './app';
import { activateView } from './shared/view/activate-view';
import { devOnlyTest } from './dev-only-test-btn';

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

    this.addRibbonIcon("reset", "test", () => {
      devOnlyTest();
    });
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