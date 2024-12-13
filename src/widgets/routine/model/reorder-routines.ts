// import { Routine } from "@entities/routine";


// interface ReorderRoutinesResult {
//   routines: Routine[];
//   requireUpdateMap: Map<string, boolean>;
// }

// /**
//  * @param task routine 순서 조정의 기반이되는 Task 배열.
//  * 해당 배열에서 routineTask들을 추출하고 이를 기반으로 실제 routine의 순서를 조정한다.
//  */
// export const reorderRoutines = async (routines: Routine[]): Promise<ReorderRoutinesResult> => {
//   type Acc = {
//     prevOrder: number;
//     arr: Routine[];
//     requireUpdateMap: Map<string, boolean>;
//   }

//   const reduce = (acc: Acc, routine: Routine): Acc => {
//     const isAscending = acc.prevOrder < routine.properties.order;

//     const newRoutine = { ...routine }
//     if(isAscending){
//       acc.requireUpdateMap.set(routine.name, false);
//     } 
//     else {
//       newRoutine.properties.order = acc.prevOrder + 100;
//       acc.requireUpdateMap.set(routine.name, true);
//     }
    
//     acc.prevOrder = newRoutine.properties.order;
//     acc.arr.push(newRoutine);
//     return acc;
//   }

//   const result = routines.reduce(reduce, {
//     prevOrder: -1,
//     arr: [] as Routine[],
//     requireUpdateMap: new Map<string, boolean>()
//   });

//   return {
//     routines: result.arr,
//     requireUpdateMap: result.requireUpdateMap
//   }
// }