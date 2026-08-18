import { RoutineNote, noteRepository, TodoTask, NoteEntity, TaskEntity } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";

/**
 * 특정 task의 수행을 다른 날짜로 재조정한다.
 * @param routineNote 루틴 노트
 * @param taskName 재조정할 task 이름
 * @param newDay 재조정된 task를 수행할 날짜
 * @returns 재조정된 루틴 노트
 */
export const rescheduleTodo = async (routineNote: RoutineNote, taskName: string, newDay: Day): Promise<RoutineNote> => {
  const _t = NoteEntity.findTask(routineNote, taskName);
  if(!_t || _t.taskType !== "todo") throw new Error(`Task not found: ${taskName}`);
  const todoTask = _t as TodoTask;

  if(newDay.isSameDay(routineNote.day)) return routineNote;

  try {
    // 실패시에 todo를 잃어버리지 않도록, 목적지 노트에 먼저 저장한 후에 기존 노트에서 제거한다.
    const destinationNote = (
      await noteRepository.load(newDay)
      ??
      (await RoutineNoteCreator.withLoadFromRepositoryAsync()).create(newDay)
    )
    const todoAddedNote = {
      ...destinationNote,
      children: [
        todoTask,
        ...destinationNote.children,
      ]
    }
    await noteRepository.save(todoAddedNote);

    const todoDeletedNote = TaskEntity.removeTask(routineNote, todoTask.name);
    await noteRepository.update(todoDeletedNote);
    return todoDeletedNote;
  } catch(e) {
    console.error("Failed to reschedule todo.", e);
    new Notice(`Failed to reschedule todo: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }
}
