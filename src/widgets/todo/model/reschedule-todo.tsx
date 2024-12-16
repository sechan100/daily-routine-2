import { RoutineNote, noteRepository, TodoTask } from "@entities/note";
import { RoutineRepository } from "@entities/routine";
import { Day } from "@shared/period/day";

/**
 * 특정 task의 수행을 다른 날짜로 재조정한다.
 * @param routineNote 루틴 노트
 * @param taskName 재조정할 task 이름
 * @param newDay 재조정된 task를 수행할 날짜
 * @returns 재조정된 루틴 노트 
 */
export const rescheduleTodo = async (routineNote: RoutineNote, taskName: string, newDay: Day): Promise<RoutineNote> => {
  // const _t = routineNote.tasks.find(task => task.name === taskName);
  // if(!_t || _t.type !== "todo") return routineNote;
  // const todoTask = _t as TodoTask;

  // const todoDeletedNote = NoteService.deleteTodoTask(routineNote, todoTask.name);
  // await NoteRepository.forceSave(todoDeletedNote);

  // const destinationNote = (
  //   await NoteRepository.load(newDay) 
  //   ??
  //   await NoteService.setLoaderForCreateAsync(RoutineRepository.loadAll)(newDay)
  // )

  // const todoAddedNote = NoteService.addTodoTask(destinationNote, todoTask);
  // await NoteRepository.forceSave(todoAddedNote);

  // return todoDeletedNote;
  return routineNote;
}