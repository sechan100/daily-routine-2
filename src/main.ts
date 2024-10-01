import { Plugin } from 'obsidian';
import { setPlugin } from './lib/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from './features/settings/DailyRoutineSettingTab';
import { DailyRoutineView } from './pages';
import { activateView } from './lib/view/activate-view';
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
      DailyRoutineView.VIEW_TYPE,
      (leaf) => new DailyRoutineView(leaf)
    );

    this.addRibbonIcon("dice", "Routine View", () => {
      activateView(DailyRoutineView.VIEW_TYPE);
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