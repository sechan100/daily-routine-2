import { isTodoTask, NoteEntity, RoutineNote, TaskEntity, TodoTask } from "@entities/note";
import { err, Result } from "neverthrow";


/**
 * note의 맨 앞에 todo를 추가한 새 노트를 반환한다. 이미 같은 이름의 task가 있으면 err.
 * 노트 파일의 최신 내용에 적용될 수 있도록 note를 바꾸지 않는다.
 */
export const addTodoToNote = (note: RoutineNote, todo: TodoTask): Result<RoutineNote, string> => {
  return TaskEntity.validateTodoName(todo.name, NoteEntity.flatten(note).map(t => t.name))
  .map(() => ({ ...note, children: [todo, ...note.children] }));
}


export type TodoEdit = {
  name: string;
  showOnCalendar: boolean;
}

/**
 * note 안의 todo(originalName)에 edit을 적용한 새 노트를 반환한다.
 * 수정 화면이 열려 있는 동안 todo의 다른 값(체크 상태 등)이 바뀌었을 수 있으므로, edit에 있는 값만 바꾸고 나머지는 note의 값을 그대로 둔다.
 * todo가 없어졌거나('not-found'), 새 이름이 다른 task와 겹치면 err.
 */
export const editTodoInNote = (note: RoutineNote, originalName: string, edit: TodoEdit): Result<RoutineNote, string> => {
  const current = NoteEntity.findTask(note, originalName);
  if(!current || !isTodoTask(current)) return err('not-found');

  const otherNames = NoteEntity.flatten(note).map(t => t.name).filter(n => n !== originalName);
  return TaskEntity.validateTodoName(edit.name, otherNames)
  .map(() => TaskEntity.updateTask(note, originalName, { ...current, name: edit.name, showOnCalendar: edit.showOnCalendar }));
}
