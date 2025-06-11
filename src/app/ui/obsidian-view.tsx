import { useRouter } from '@/shared/route/use-router';
import { ReactView } from '@/shared/view/react-view';
import { IconName, WorkspaceLeaf } from "obsidian";
import { DailyRoutineView } from "./DailyRoutineView";
import { DAILY_ROUTINE_ICON_NAME } from "./daily-routine-icon";
import { INITIAL_PAGE, PAGES } from './pages';



export class DailyRoutineObsidianView extends ReactView {
  static VIEW_TYPE = "daily-routine-view";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf, {
      viewTypeName: DailyRoutineObsidianView.VIEW_TYPE,
      displayText: "Routine"
    });
  }

  render() {
    // tab 초기화
    const getInitialPage = () => {
      for (const page of PAGES) {
        if (page.name === INITIAL_PAGE) {
          return page;
        }
      }
      throw new Error(`Initial page ${INITIAL_PAGE} not found in PAGES.`);
    }
    useRouter.setState({
      current: getInitialPage(),
      pages: PAGES,
    });
    return <DailyRoutineView />
  }

  getIcon(): IconName {
    return DAILY_ROUTINE_ICON_NAME;
  }
}