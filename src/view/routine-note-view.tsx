import { RoutineNote } from "../model/routine-note";
import { RoutineComponent } from "./routine";



interface Props {
  routineNote: RoutineNote
}
export const RoutineNoteView = ({ routineNote }: Props) => {
  return (
    <div>
      {routineNote.routines.map((routine, idx) => {
        return (
          <div key={idx}>
            <RoutineComponent routine={routine}  />
          </div>
        )
      })}
    </div>
  );
}
