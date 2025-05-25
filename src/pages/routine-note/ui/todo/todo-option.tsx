/** @jsxImportSource @emotion/react */
import { NoteRepository, TaskEntity, TodoTask } from '@/entities/note';
import { createModal, ModalApi } from '@/shared/components/modal/create-modal';
import { Modal } from '@/shared/components/modal/styled';
import { dr } from '@/shared/utils/daily-routine-bem';
import { memo, useCallback, useMemo, useState } from "react";
import { useRoutineNoteStore } from '../../model/use-routine-note';


interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const bem = useMemo(() => dr("todo-option"), []);
  const { note, setNote } = useRoutineNoteStore();
  const [todo, setTodo] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => propsTodo.name, [propsTodo]);

  const onSaveBtnClick = useCallback(async () => {
    if (todo.name.trim() === "") return;
    const newNote = TaskEntity.updateTask(note, originalName, todo);
    setNote(newNote);
    await NoteRepository.update(newNote);
    modal.close();
  }, [modal, note, originalName, setNote, todo]);


  return (
    <Modal header='Todo option' modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name }))}
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name="Show on calendar"
        value={todo.showOnCalendar}
        onChange={(showOnCalendar) => setTodo(todo => ({ ...todo, showOnCalendar }))}
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
  sidebarLayout: true,
});