import { routineManager, Routine } from "./routine"
import { Day } from "lib/day";


export interface RoutineNote {
  title: string;
  day: Day;
  routines: Routine[];
}


export const createNewRoutineNote = async (): Promise<RoutineNote> => {
  const day = Day.fromNow();
  const routines = await routineManager.getAllRoutines();
  
  const todayRoutines = routines.filter(r => {
    return r.properties.dayOfWeeks.contains(day.getDayOfWeek());
  });

  return {
    title: day.getAsUserCustomFormat(),
    day: day,
    routines: todayRoutines
  }
}