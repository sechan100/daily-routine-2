import { routineManager } from "./model/routine";
import { createNewRoutineNote } from "./model/routine-note";


export const devOnlyTest = () => {
  console.log('=== dev only test 실행 ===')
  test();
}



const test = () => {
  routineManager.edit('🖊️ 문서 작성하기', {
    name: '🖊️ 문서 작성하기ㅋ',
    newProperties: {
      dayOfWeeks: [1, 2, 3, 4, 5, 6, 0]
    }
  });
}