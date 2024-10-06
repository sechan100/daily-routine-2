import { routineNoteArchiver } from "entities/archive";
import { RoutineTask } from "entities/routine-note";
import { routineManager } from "entities/routine";
import { useCallback } from "react";
import { RoutineComponent } from "./routine";
import { useRoutineNote } from "./use-routine-note";
import { AddRoutineModal } from "./add-routine";



export const NoteView = () => {
  const routineNote = useRoutineNote(s=>s.routineNote);

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
        <div>
          <h1>Daily Routine</h1>
          <span>{routineNote.day.getBaseFormat()}</span>
        </div>
        <button className="dr-note__add-routine" onClick={() => new AddRoutineModal().open()}>+ Routine</button>
      </header>
      {routineNote.tasks.map((task, idx) => {
        return (
          <div key={idx}>
            <RoutineComponent onCheckChange={onCheckChange} routine={task}  />
          </div>
        )
      })}
    </div>
  );
}