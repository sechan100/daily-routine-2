import { RoutineNote, routineNoteArchiver, RoutineTask } from "entities/archive";
import { RoutineComponent } from "./routine";
import React, { useCallback } from "react";
import "./style.css";
import { routineManager } from "entities/routine";



interface Props {
  routineNote: RoutineNote
}
export const RoutineNoteView = ({ routineNote }: Props) => {

  // 루틴 체크, 혹은 체크해제시 콜백
  const onCheckChange = useCallback((routine: RoutineTask, checked: boolean) => {
    // 개별루틴 업데이트
    routineManager.updateAchievement({
      routineName: routine.name, 
      day: routineNote.day,
      checked
    });

    // 루틴노트 업데이트
    routineNoteArchiver.updateTaskCheck(routineNote, routine.name, checked);
  }, [routineNote]);


  return (
    <div className="dr-note">
      <header className="dr-note__header">
        <h1>Daily Routine</h1>
        <span>{routineNote.day.getAsUserCustomFormat()}</span>
      </header>
      {routineNote.tasks.map((task, idx) => {
        return (
          <div key={idx}>
            <RoutineComponent onCheckChange={onCheckChange} task={task}  />
          </div>
        )
      })}
    </div>
  );
}
