/** @jsxImportSource @emotion/react */
import { NoteEntity, RoutineNote, TaskEntity, TodoTask } from '@entities/note';
import { useRoutineNote } from '@features/note';
import { updateNoteChecked } from '@features/task-el/model/update-note';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { Result } from "neverthrow";
import { Notice } from "obsidian";
import { memo, useCallback, useMemo, useState } from "react";
import { editTodoInNote } from "../todo-edit";
import { todoNameErrorMessage } from "../todo-name-error";
import { t } from "@shared/i18n";


interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const routineNote = useRoutineNote();
  const { note } = routineNote;
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => propsTodo.name, [propsTodo]);

  const onSaveBtnClick = useCallback(async () => {
    // 앞뒤 공백은 노트를 다시 읽을 때 제거되므로, 처음부터 제거한 이름으로 검증하고 저장한다.
    const name = todo.name.trim();
    const otherNames = NoteEntity.flatten(note).map(t => t.name).filter(n => n !== originalName);
    const validation = TaskEntity.validateTodoName(name, otherNames);
    if(validation.isErr()){
      new Notice(todoNameErrorMessage(validation.error, name));
      return;
    }
    // 파일의 최신 내용에서 이름과 캘린더 표시만 바꾼다. 수정 화면을 여는 동안 체크 상태 등이 바뀌었어도 되돌리지 않고,
    // 그 사이 같은 이름이 생겼다면 아무것도 쓰지 않는다.
    let result: Result<RoutineNote, string>;
    try {
      result = await updateNoteChecked(note, current => {
        return editTodoInNote(current, originalName, { name, showOnCalendar: todo.showOnCalendar });
      });
    } catch(e) {
      console.error("Failed to save todo.", e);
      new Notice(t("tasks.todo.saveFailed"));
      return;
    }
    if(result.isErr()){
      new Notice(todoNameErrorMessage(result.error, name));
      return;
    }
    routineNote.setNote(result.value);
    modal.close();
  }, [modal, note, originalName, routineNote, todo]);


  return (
    <Modal header={t("tasks.todo.editTitle")} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name}))}
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name={t("common.showOnCalendar")}
        value={todo.showOnCalendar}
        onChange={(showOnCalendar) => setTodo(todo => ({...todo, showOnCalendar}))}
      />
      <Modal.Separator />

      {/* save */}
      <Modal.SaveBtn
        disabled={todo.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  )
}), {
  // 입력 항목이 적어 화면을 덮는 큰 모달 대신 작은 모달로 띄운다.
  sidebarLayout: false,
});