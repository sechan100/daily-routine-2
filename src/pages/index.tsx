import { WorkspaceLeaf } from "obsidian";
import { ReactView } from "../lib/view/react-view";
import { RoutineNoteView } from "../features/routine-note";
import { RoutineNote, routineNoteArchiver } from "entities/archive";
import { useEffect, useState } from "react";
import { Day } from "lib/day";
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


/**
 * 실제 ROOT PAGE 컴포넌트
 */
const DailyRoutineViewComponent = () => {

  return (
    <div>
      <RoutineNoteView />
    </div>
  );
}