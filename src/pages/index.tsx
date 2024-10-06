import { RoutineNoteView } from "features/routine-note";
import { RoutineCalendar } from "features/calendar";
////////////////////////////////////
import { WorkspaceLeaf } from "obsidian";
import { ReactView } from "../libs/view/react-view";
import { useState } from "react";
import "./style.css";


export class DailyRoutineView extends ReactView {
  static VIEW_TYPE = "daily-routine-view";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf, {
      viewTypeName: DailyRoutineView.VIEW_TYPE,
      displayText: "Routine"
    });
  }


  render() {
    return (
      <DailyRoutineViewComponent />
    )
  }
}





type DrPage = "calendar" | "note";
/**
 * 실제 ROOT PAGE 컴포넌트
 */
const DailyRoutineViewComponent = () => {
  const [page, setPage] = useState<DrPage>("note");

  return (
    <div>
      <div>
        <button onClick={() => setPage("note")}>Note</button>
        <button onClick={() => setPage("calendar")}>Calendar</button>
      </div>
      {page === "note" && <RoutineNoteView />}
      {page === "calendar" && <RoutineCalendar />}
    </div>
  );
}