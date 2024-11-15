/* eslint-disable @typescript-eslint/no-var-requires */
import { Plugin, moment } from 'obsidian';
import { setPlugin } from '@shared/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from '@app/settings/DailyRoutineSettingTab';
import { DailyRoutineObsidianView } from './app';
import { activateView } from '@shared/view/activate-view';
import { updateMomentConfig } from '@app/settings/moment-config';


export default class DailyRoutinePlugin extends Plugin {
	settings: DailyRoutinePluginSettings;

	async onload() {
		await this.loadSettings();

    // plugin locator 설정
    setPlugin(this);

    // setting tab
    this.addSettingTab(new DailyRoutineSettingTab(this.app, this));

    // moment config
    updateMomentConfig({
      isMondayStartOfWeek: this.settings.isMondayStartOfWeek
    });

    this.registerView(
      DailyRoutineObsidianView.VIEW_TYPE,
      (leaf) => new DailyRoutineObsidianView(leaf)
    );

    this.addRibbonIcon("dice", "Routine View", () => {
      activateView(DailyRoutineObsidianView.VIEW_TYPE, confirm("Open on the left?") ? 1 : 0);
    });

    this.addRibbonIcon("ribbon", "Mobile Toggle", () => {
      // @ts-ignore
      this.app.emulateMobile(!this.app.isMobile);
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