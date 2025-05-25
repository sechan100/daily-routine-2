import { ReactView } from '@/shared/view/react-view';
import { IconName, WorkspaceLeaf } from "obsidian";
import { DailyRoutineView } from "./ui/DailyRoutineView";
import { DAILY_ROUTINE_ICON_NAME } from "./ui/daily-routine-icon";



export class DailyRoutineObsidianView extends ReactView {
  static VIEW_TYPE = "daily-routine-view";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf, {
      viewTypeName: DailyRoutineObsidianView.VIEW_TYPE,
      displayText: "Routine"
    });
  }

  render() {
    return <DailyRoutineView />
  }

  getIcon(): IconName {
    return DAILY_ROUTINE_ICON_NAME;
  }
}