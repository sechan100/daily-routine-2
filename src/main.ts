/* eslint-disable @typescript-eslint/no-var-requires */
import { DailyRoutineSettingTab } from '@/app/settings/DailyRoutineSettingTab';
import { DAILY_ROUTINE_ICON_NAME } from '@/app/ui/daily-routine-icon';
import { setPlugin } from '@/shared/utils/plugin-service-locator';
import { activateView } from '@/shared/view/activate-view';
import { Platform, Plugin } from 'obsidian';
import { DailyRoutineObsidianView } from './app';
import { initObsidianProtocalHandler } from './app/obsidian/init-obsidian-protocal-handler';
import { schemaMigrationEntrypoint } from './app/schema-migration/migration-entrypoint';
import { DailyRoutineSettings, DEFAULT_SETTINGS } from "./shared/settings";


export default class DailyRoutinePlugin extends Plugin {
  settings: DailyRoutineSettings;

  async onload() {
    await this.loadSettings();
    // 전역 플러그인 locator 설정
    setPlugin(this);

    // setting tab
    this.addSettingTab(new DailyRoutineSettingTab(this.app, this));

    // 개발모드 전용 모바일 전환 버튼
    process.env.NODE_ENV === "development" && this.addRibbonIcon(
      "toggle-left",
      "Toggle mobile view",
      // @ts-ignore
      () => this.app.emulateMobile(!Platform.isMobile)
    );

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

    initObsidianProtocalHandler(this);

    // 앱이 로드되면 실행
    this.app.workspace.onLayoutReady(() => {
      schemaMigrationEntrypoint();
      activateView(DailyRoutineObsidianView.VIEW_TYPE, 1);
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