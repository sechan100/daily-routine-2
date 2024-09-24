import { WorkspaceLeaf } from "obsidian";
import { ReactView } from "../shared/view/react-view";


export class RoutineView extends ReactView {
  static VIEW_TYPE = "daily-routine-view";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf, {
      viewTypeName: RoutineView.VIEW_TYPE,
      displayText: "Routine"
    });
  }


  render() {

    return (
      <div>
        <h1>Routine</h1>
      </div>
    );
  }
}