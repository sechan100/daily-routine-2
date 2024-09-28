import { plugin } from "src/shared/utils/plugin-service-locator";
import { getRoutines } from "./routine"
import { momentProvider } from "src/shared/utils/date-time";



export const createNewRoutineNote = async () => {
  const now = momentProvider.getDateTime();
  console.log(now);
  const routines = await getRoutines();
}