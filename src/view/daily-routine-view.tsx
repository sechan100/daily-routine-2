import { WorkspaceLeaf } from "obsidian";
import { ReactView } from "../shared/view/react-view";
import { RoutineNoteView } from "./routine-note-view";
import { createNewRoutineNote, RoutineNote } from "../model/routine-note";
import { useEffect, useState } from "react";


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


const DailyRoutineViewComponent = () => {
  const [routineNote, setRoutineNote] = useState<RoutineNote>({
    routines: [],
    title: "Fallback"
  });

  useEffect(() => {
    createNewRoutineNote().then(routineNote => {
      setRoutineNote(routineNote)
    });
  }, []);

  return (
    <div>
      <RoutineNoteView routineNote={routineNote} />
    </div>
  );
}