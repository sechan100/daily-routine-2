import { getRoutines } from "./routine/routine";
import { createNewRoutineNote } from "./routine/routine-note";


export const devOnlyTest = () => {
  console.log('=== dev only test 실행 ===')
  test();
}



const test = () => {
  createNewRoutineNote();
}