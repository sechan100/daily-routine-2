/** @jsxImportSource @emotion/react */
import { NoteRepository, TaskEntity, TodoTask } from "@/entities/note";
import { createModal, ModalApi } from "@/shared/components/modal/create-modal";
import { Modal } from "@/shared/components/modal/styled";
import { dr } from "@/shared/utils/daily-routine-bem";
import { useCallback, useMemo, useState } from "react";
import { useRoutineNoteStore } from "../../model/use-routine-note";


export const useAddTodoModal = createModal(({ modal }: { modal: ModalApi }) => {
  const { note, setNote } = useRoutineNoteStore();
  const [todo, setTodo] = useState<TodoTask>(TaskEntity.createTodoTask(""));

  const onSaveBtnClick = useCallback(() => {
    const newNote = {
      ...note,
      children: [todo, ...note.children]
    }
    // NOTE: Todo 만들기는 거의 사용자가 원하는 동작임이 분명함으로, 노트가 없다면 강제로 생성해서 저장함. (confirm 띄우지 않음)
    NoteRepository.save(newNote);
    setNote(newNote);
    modal.close();
  }, [modal, note, setNote, todo]);


  const bem = useMemo(() => dr("add-todo-modal"), []);
  return (
    <Modal className={bem()} header="Add new todo" modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name }))}
        placeholder="New todo"
        focus
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name="Show on calendar"
        value={todo.showOnCalendar}
        onChange={showOnCalendar => setTodo(todo => ({ ...todo, showOnCalendar }))}
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
  sidebarLayout: true,
})
