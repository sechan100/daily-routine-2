// import { noteRepository, noteTaskService, RoutineNote, routineTreeUtils, Task, useNoteDayStore, useTasksStore } from "@/entities/note";
// import { doConfirm } from "@/shared/components/modal/confirm-modal";
// import { SETTINGS } from "@/shared/settings";
// import { useCallback } from "react";





// type UseCheckTask = (task: Task) => {
//   handleTaskClick: () => void;
// }
// export const useCheckTask: UseCheckTask = (task) => {
//   const day = useNoteDayStore(s => s.day);
//   const taskName = task.name;
//   const tasks = useTasksStore(s => s.tasks);
//   const setTasks = useTasksStore(s => s.setTasks);

//   const handleTaskClick = useCallback(async () => {
//     const newTasks = [...tasks];
//     const newTask = noteTaskService.findTask(newTasks, taskName);

//     // dispatch check state change
//     // un-check
//     if (routine.state === "unchecked") {
//       routine.state = "accomplished";
//     }
//     // accomplished & failed
//     else if (routine.state === "accomplished" || routine.state === "failed") {
//       let doUncheck = true;
//       if (SETTINGS.getConfirmUncheckTask()) {
//         doUncheck = await doConfirm({
//           title: "Uncheck Task",
//           description: "Are you sure you want to uncheck this task?",
//           confirmText: "Uncheck",
//           confirmBtnVariant: "accent",
//         })
//       }
//       if (doUncheck) {
//         routine.state = "unchecked";
//       }
//     }
//     else {
//       throw new Error(`Unknown routine state: ${routine.state}`);
//     }
//     // data 업데이트
//     await noteRepository.updateWith(day, (prev) => {
//       const newNote: RoutineNote = {
//         ...prev,
//         routineTree: newTree
//       }
//       return newNote;
//     });
//     // 상태 업데이트
//     setTree(newTree);
//   }, [tree, routineName, day, setTree]);

//   return {
//     handleTaskClick
//   }
// }
