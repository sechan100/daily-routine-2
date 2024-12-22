/** @jsxImportSource @emotion/react */
import { noteRepository, TaskEntity, TodoTask } from '@entities/note';
import { useRoutineNote } from '@features/note';
import { Button } from '@shared/components/Button';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { memo, useCallback, useMemo, useState } from "react";


interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const bem = useMemo(() => dr("todo-option"), []);
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => propsTodo.name, [propsTodo]);

  const onSaveBtnClick = useCallback(async () => {
    if(todo.name.trim() === "") return;
    const newNote = TaskEntity.updateTask(note, originalName, todo);
    setNote(newNote);
    await noteRepository.update(newNote);
    modal.close();
  }, [modal, note, originalName, setNote, todo]);


  return (
    <Modal header='Todo Option' modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name}))}
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name="Show On Calendar"
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
  sidebarLayout: true,
});