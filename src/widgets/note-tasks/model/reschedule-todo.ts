// import { noteRepository, NoteService, RoutineNote, TaskEntity, TodoTask } from "@/entities/note";
// import { RoutineNoteCreator } from '@/entities/routine-to-note';
// import { Day } from "@/shared/period/day";

// /**
//  * 특정 task의 수행을 다른 날짜로 재조정한다.
//  * @param routineNote 루틴 노트
//  * @param taskName 재조정할 task 이름
//  * @param newDay 재조정된 task를 수행할 날짜
//  * @returns 재조정된 루틴 노트 
//  */
// export const rescheduleTodo = async (routineNote: RoutineNote, taskName: string, newDay: Day): Promise<RoutineNote> => {
//   const _t = NoteService.findTask(routineNote, taskName);
//   if (!_t || _t.taskType !== "todo") throw new Error(`Task not found: ${taskName}`);
//   const todoTask = _t as TodoTask;

//   const todoDeletedNote = TaskEntity.removeTask(routineNote, todoTask.name);
//   await noteRepository.update(todoDeletedNote);

//   const destinationNote = (
//     await noteRepository.load(newDay)
//     ??
//     (await RoutineNoteCreator.withLoadFromRepositoryAsync()).create(newDay)
//   )
//   const todoAddedNote = {
//     ...destinationNote,
//     children: [
//       todoTask,
//       ...destinationNote.children,
//     ]
//   }
//   await noteRepository.save(todoAddedNote);
//   return todoDeletedNote;
// }