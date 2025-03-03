/* eslint-disable @typescript-eslint/no-var-requires */
import { Plugin, Platform, moment } from 'obsidian';
import { setPlugin } from '@shared/utils/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, DEFAULT_SETTINGS } from '@app/settings/DailyRoutineSettingTab';
import { DailyRoutineObsidianView } from './app';
import { activateView } from '@shared/view/activate-view';
import { DAILY_ROUTINE_ICON_NAME } from '@app/ui/daily-routine-icon';


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
    
    this.addCommand({
      id: "daily-routine-open-routine-view",
      icon: DAILY_ROUTINE_ICON_NAME,
      name: "Open routine view",
      callback: () => {
        activateView(DailyRoutineObsidianView.VIEW_TYPE, 1);
      }
    });

    process.env.NODE_ENV === "development" && this.addRibbonIcon(
      "toggle-left",
      "Toggle mobile view",
      // @ts-ignore
      () => this.app.emulateMobile(!Platform.isMobile)
    );
    
    setTimeout(() => activateView(DailyRoutineObsidianView.VIEW_TYPE, 1), 500);
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