import { ReactView } from "shared/view/react-view";
import { WorkspaceLeaf } from "obsidian";
import { DailyRoutineView } from "./DailyRoutineView";




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
}