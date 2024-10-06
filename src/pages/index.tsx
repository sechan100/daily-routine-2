import { Menu, WorkspaceLeaf } from "obsidian";
import { ReactView } from "../libs/view/react-view";
import { RoutineNoteView } from "../features/routine-note";
import { RoutineNote, routineNoteArchiver } from "entities/archive";
import { useEffect, useState } from "react";
import { Day } from "libs/day";
import "./style.css";
import { RoutineCalendar } from "features/calendar";


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


/**
 * 실제 ROOT PAGE 컴포넌트
 */
const DailyRoutineViewComponent = () => {
  const [page, setPage] = useState<"calendar" | "note">("calendar");

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