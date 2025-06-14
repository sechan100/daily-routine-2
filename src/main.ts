/* eslint-disable @typescript-eslint/no-var-requires */
import { DailyRoutineSettingTab } from '@/app/settings/DailyRoutineSettingTab';
import { DAILY_ROUTINE_ICON_NAME } from '@/app/ui/daily-routine-icon';
import { activateView } from '@/shared/view/activate-view';
import { Platform, Plugin } from 'obsidian';
import { initObsidianProtocalHandler } from './app/obsidian/init-obsidian-protocal-handler';
import { setPlugin } from './app/plugin';
import { schemaMigrationEntrypoint } from './app/schema-migration/migration-entrypoint';
import { DailyRoutineObsidianView } from './app/ui/obsidian-view';
import { DailyRoutineSettings, DEFAULT_SETTINGS } from './shared/settings';
import { updateSettingsStores } from './stores/client/use-settings-store';


export default class DailyRoutinePlugin extends Plugin {
  settings: DailyRoutineSettings;

  async onload() {
    // settings 데이터 불러오기(data.json)
    await this.loadSettings();

    // settings를 내부적으로 쓰는 zustand store에 동기화
    updateSettingsStores(this.settings);

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
}