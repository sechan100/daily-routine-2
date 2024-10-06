import { Day } from "libs/day";
import { useRoutineNote } from "./use-routine-note";
import clsx from "clsx";


export const DaysMenu = () => {
  const routineNote = useRoutineNote(s=>s.routineNote);
  const setRoutineNote = useRoutineNote(s=>s.setRoutineNote);


  const today = Day.now();
  return (
    <div className="dr-days">
      <div className="dr-days__flex">
        {today.getCurrentWeek().map((day, idx) => {
          return (
            <button key={idx} className={clsx("dr-days__item", {
              "dr-days__today": day.isSameDay(today),
              "dr-days__current": day.isSameDay(routineNote.day)
            })} onClick={() => {
              setRoutineNote(day);
            }}>
              <div>{day.format("ddd")}</div>
              <div>{day.format("M/D")}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}