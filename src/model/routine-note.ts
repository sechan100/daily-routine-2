import { routineManager, Routine } from "./routine"
import { momentProvider } from "src/shared/utils/moment-provider";


export interface RoutineNote {
  title: string;
  routines: Routine[];
}


export const createNewRoutineNote = async (): Promise<RoutineNote> => {
  const now = momentProvider.getNow();
  const routines = await routineManager.getAllRoutines();
  
  const todayRoutines = routines.filter(r => r.properties.dayOfWeeks.contains(momentProvider.getDayOfWeekNum()));

  return {
    title: now,
    routines: todayRoutines
  }
}