/** @jsxImportSource @emotion/react */
import { DR_SETTING } from "@app/settings/setting-provider";
import { NoteEntity, RoutineNote, TaskEntity, TodoTask } from "@entities/note";
import { useRoutineNote } from "@features/note";
import { updateNoteChecked } from "@features/task-el/model/update-note";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/utils/daily-routine-bem";
import { Result } from "neverthrow";
import { Notice } from "obsidian";
import { useCallback, useMemo, useState } from "react";
import { addTodoToNote } from "../todo-edit";
import { todoNameErrorMessage } from "../todo-name-error";
import { t } from "@shared/i18n";


export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi}) => {
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(() => TaskEntity.createTodoTask("", DR_SETTING.defaultTodoShowOnCalendar()));
  
  const onSaveBtnClick = useCallback(async () => {
    // 앞뒤 공백은 노트를 다시 읽을 때 제거되므로, 처음부터 제거한 이름으로 검증하고 저장한다.
    const name = todo.name.trim();
    const validation = TaskEntity.validateTodoName(name, NoteEntity.flatten(note).map(t => t.name));
    if(validation.isErr()){
      new Notice(todoNameErrorMessage(validation.error, name));
      return;
    }
    const newTodo: TodoTask = { ...todo, name };
    // NOTE: Todo 만들기는 거의 사용자가 원하는 동작임이 분명함으로, 노트가 없다면 강제로 생성해서 저장함. (confirm 띄우지 않음)
    // 파일이 있으면 파일의 최신 내용에 추가한다. 그 사이 파일에 같은 이름이 생겼다면 아무것도 쓰지 않는다.
    let result: Result<RoutineNote, string>;
    try {
      result = await updateNoteChecked(note, current => addTodoToNote(current, newTodo));
    } catch(e) {
      console.error("Failed to save todo.", e);
      new Notice(t("tasks.todo.saveFailed"));
      return;
    }
    if(result.isErr()){
      new Notice(todoNameErrorMessage(result.error, name));
      return;
    }
    setNote(result.value);
    modal.close();
  }, [modal, note, setNote, todo]);


  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header={t("tasks.todo.addTitle")} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={todo.name}
        onChange={name => setTodo(todo => ({...todo, name}))}
        placeholder={t("tasks.todo.newPlaceholder")}
        focus
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name={t("common.showOnCalendar")}
        value={todo.showOnCalendar}
        onChange={showOnCalendar => setTodo(todo => ({...todo, showOnCalendar}))}
      />
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        disabled={todo.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  );
}, {
  // 입력 항목이 적어 화면을 덮는 큰 모달 대신 작은 모달로 띄운다.
  sidebarLayout: false,
})
