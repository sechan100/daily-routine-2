import { RoutineNote, noteRepository, NoteEntity, TaskEntity, isTodoTask } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { updateNote, updateNoteChecked } from "@features/task-el/model/update-note";
import { formatFullDate, t } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { err, ok, Result } from "neverthrow";
import { Notice } from "obsidian";
import { addTodoToNote } from "./todo-edit";

const refuse = (message: string): Result<RoutineNote, string> => {
  new Notice(message);
  return err(message);
}

/**
 * 특정 task의 수행을 다른 날짜로 재조정한다.
 * 재조정할 수 없는 경우는 사용자에게 이유를 Notice로 알리고 err를 반환한다.
 * @param routineNote 루틴 노트
 * @param taskName 재조정할 task 이름
 * @param newDay 재조정된 task를 수행할 날짜
 * @returns 재조정된 루틴 노트
 */
export const rescheduleTodo = async (routineNote: RoutineNote, taskName: string, newDay: Day): Promise<Result<RoutineNote, string>> => {
  if(newDay.isSameDay(routineNote.day)) return refuse(t("tasks.todo.alreadyOnDate", { name: taskName, date: formatFullDate(newDay) }));

  try {
    // 확인창을 기다리는 동안 파일이 바뀌었을 수 있으므로, 옮길 todo는 파일의 최신 내용에서 가져온다.
    const sourceNote = (await noteRepository.load(routineNote.day)) ?? routineNote;
    const todoTask = NoteEntity.findTask(sourceNote, taskName);
    if(!todoTask || !isTodoTask(todoTask)) return refuse(t("tasks.todo.notFound", { name: taskName }));

    // 실패시에 todo를 잃어버리지 않도록, 목적지 노트에 먼저 저장한 후에 기존 노트에서 제거한다.
    // 목적지 노트 파일이 없을 때만 루틴으로부터 노트를 새로 만든다.
    const destinationBase = noteRepository.isExist(newDay)
      ? { day: newDay, children: [] }
      : (await RoutineNoteCreator.withLoadFromRepositoryAsync()).create(newDay);
    // 노트 안의 task는 이름으로 식별되므로, 목적지의 최신 내용에 같은 이름이 있으면 옮길 수 없다.
    const added = await updateNoteChecked(destinationBase, current => addTodoToNote(current, todoTask));
    if(added.isErr()) return refuse(t("tasks.todo.existsOnDate", { name: todoTask.name, date: formatFullDate(newDay) }));

    const todoDeletedNote = await updateNote(routineNote, current => {
      return NoteEntity.findTask(current, todoTask.name) ? TaskEntity.removeTask(current, todoTask.name) : current;
    });
    return ok(todoDeletedNote);
  } catch(e) {
    console.error("Failed to reschedule todo.", e);
    return refuse(t("tasks.todo.rescheduleFailed"));
  }
}
