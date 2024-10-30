import { RoutineNote, routineNoteArchiver, routineNoteService, Task, TodoTask } from "entities/note";
import { Day } from "shared/day";

/**
 * 특정 task의 수행을 다른 날짜로 재조정한다.
 * @param routineNote 루틴 노트
 * @param taskName 재조정할 task 이름
 * @param newDay 재조정된 task를 수행할 날짜
 * @returns 재조정된 루틴 노트 
 */
export const rescheduleTodo = async (routineNote: RoutineNote, taskName: string, newDay: Day): Promise<RoutineNote> => {
  const _t = routineNote.tasks.find(task => task.name === taskName);
  if(!_t || _t.type !== "todo") return routineNote;
  const todoTask = _t as TodoTask;

  const todoDeletedNote = routineNoteService.deleteTodoTask(routineNote, todoTask.name);
  await routineNoteArchiver.save(todoDeletedNote);

  const destinationNote = (
    await routineNoteArchiver.load(newDay) 
    ??
    await routineNoteService.create(newDay)
  )

  const todoAddedNote = routineNoteService.addTodoTask(destinationNote, todoTask);
  await routineNoteArchiver.save(todoAddedNote);

  return todoDeletedNote;
}