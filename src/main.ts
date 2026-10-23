import { Notice, Plugin, Platform } from 'obsidian';
import { noteRepository } from '@entities/note';
import { t } from '@shared/i18n';
import { setPlugin } from '@shared/utils/plugin-service-locator';
import { DailyRoutinePluginSettings, DailyRoutineSettingTab, migrateSettings } from '@app/settings/DailyRoutineSettingTab';
import { DailyRoutineObsidianView } from './app';
import { activateView } from '@shared/view/activate-view';
import { registerCommands } from '@app/commands';


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
    
    registerCommands(this);

    process.env.NODE_ENV === "development" && this.addRibbonIcon(
      "toggle-left",
      "Toggle mobile view",
      // @ts-expect-error -- emulateMobile은 공개 타입 정의에 없는 내부 API다.
      () => this.app.emulateMobile(!Platform.isMobile)
    );
    
    // 앱을 시작할 때만, layout 복원이 끝난 뒤에 뷰가 없으면 생성한다. (사이드바를 강제로 열지는 않는다)
    // 실행 중에 플러그인이 다시 켜지면(업데이트 등) Obsidian이 onload 뒤에 기존 뷰를 복원하므로, 여기서 만들면 뷰가 두 개가 된다.
    this.app.workspace.onLayoutReady(() => {
      void this.migrateLegacyNoteFileNames();
    });

    if(!this.app.workspace.layoutReady){
      this.app.workspace.onLayoutReady(() => {
        void activateView(DailyRoutineObsidianView.VIEW_TYPE, 1, false);
      });
    }
  }

  /**
   * 이전 버전이 앱 언어의 숫자로 이름 붙인 노트 파일('٢٠٢٦-١٠-٢٣.md')을 'YYYY-MM-DD.md'로 바꾼다.
   * 이름을 바꾸기 전에도 노트 저장소가 그런 파일을 같은 날짜로 찾으므로, 이 작업이 늦게 끝나도 노트가 둘로 갈라지지 않는다.
   */
  private async migrateLegacyNoteFileNames() {
    try {
      const { conflicts } = await noteRepository.migrateLegacyFileNames();
      if(conflicts.length > 0) new Notice(t("common.legacyNoteNameConflict", { paths: conflicts.join(", ") }), 0);
    } catch(e) {
      console.error("[Daily Routine] Failed to rename legacy note files.", e);
    }
  }

  // 사용자가 설정에서 플러그인을 켰을 때(설치 직후 포함) 뷰를 열어 보여준다.
  onUserEnable() {
    void activateView(DailyRoutineObsidianView.VIEW_TYPE, 1);
  }
  
  onunload() {
  }

	async loadSettings() {
		this.settings = migrateSettings(await this.loadData());
	}

  async saveSettings() {
    await this.saveData(this.settings);
  }
}