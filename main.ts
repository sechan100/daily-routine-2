import { Plugin } from 'obsidian';
import { setPlugin } from 'src/shared/utils/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from 'src/settings/DailyRoutineSettingTab';
import { RoutineView } from 'src/routine/routine-view';
import { activateView } from 'src/shared/view/activate-view';

export default class DailyRoutinePlugin extends Plugin {
	settings: DailyRoutinePluginSettings;

	async onload() {
		await this.loadSettings();

    // plugin locator 설정
    setPlugin(this);

    // setting tab
    this.addSettingTab(new DailyRoutineSettingTab(this.app, this));

    this.registerView(
      RoutineView.VIEW_TYPE,
      (leaf) => new RoutineView(leaf)
    );

    this.addRibbonIcon("dice", "Routine View", () => {
      activateView(RoutineView.VIEW_TYPE);
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