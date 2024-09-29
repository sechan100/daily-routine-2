import { RoutineNote } from "../../model/routine-note";
import { RoutineComponent } from "../routine";
import React, { useCallback } from "react";
import "./index.css";
import { Routine, routineManager } from "model/routine";



interface Props {
  routineNote: RoutineNote
}
export const RoutineNoteView = ({ routineNote }: Props) => {

  const onCheckChange = useCallback((routine: Routine, checked: boolean) => {
    routineManager.updateAchievement({
      routineName: routine.name, 
      day: routineNote.day,
      checked
    });
  }, [routineNote]);


  return (
    <div className="dr-note">
      <header className="dr-note__header">
        <h1>Daily Routine</h1>
        <span>{routineNote.title}</span>
      </header>
      {routineNote.routines.map((routine, idx) => {
        return (
          <div key={idx}>
            <RoutineComponent onCheckChange={onCheckChange} routine={routine}  />
          </div>
        )
      })}
    </div>
  );
}
