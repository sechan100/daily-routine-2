/** @jsxImportSource @emotion/react */
import { Notice } from "obsidian";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { createModal, ModalApi } from 'shared/components/modal/create-modal';
import { dr } from 'shared/daily-routine-bem';
import { openConfirmModal } from 'shared/components/modal/confirm-modal';
import { Modal } from 'shared/components/modal/styled';
import { routineNoteArchiver, routineNoteService, TodoTask, useRoutineNote } from 'entities/note';
import { rescheduleTodo } from "./reschedule-todo";
import { Day } from "shared/day";




interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const bem = useMemo(() => dr("todo-option"), []);

  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => todo.name, [todo]);


  useEffect(() => {
    modal.onClose(() => {
      if(todo.name.trim() !== ""){
        const newNote = routineNoteService.editTodoTask(note, originalName, todo);
        setNote(newNote);
      }
    })
  }, [modal, note, originalName, setNote, todo]);


  const onRescheduleBtnClick = useCallback(async (destDay: Day) => {
    const todoDeletedNote = await rescheduleTodo(note, originalName, destDay);
    setNote(todoDeletedNote);
    new Notice(`Todo ${todo.name} rescheduled to ${destDay.getBaseFormat()}.`);
    modal.closeWithoutOnClose();
  }, [modal, note, originalName, setNote, todo.name]);


  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const onConfirm = () => {
      const deletedNote = routineNoteService.deleteTodoTask(note, originalName);
      routineNoteArchiver.save(deletedNote);
      setNote(deletedNote);
      modal.closeWithoutOnClose();
    new Notice(`Todo ${todo.name} deleted.`);
    }

    openConfirmModal({
      onConfirm,
      className: bem("delete-confirm-modal"),
      confirmText: "Delete",
      description: `Are you sure you want to delete '${todo.name}'?`,
      confirmBtnVariant: "destructive"
    })
  }, [bem, modal, note, originalName, setNote, todo.name])


  return (
    <Modal header='Todo Option' modal={modal}>
      {/* name */}
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={todo.name}
          onChange={name => setTodo({ ...todo, name,})}
        />
      </Modal.Section>
      <Modal.Separator />

      {/* reschedule */}
      <Modal.Section className={bem("reschedule")}>
        <Modal.Name>Reschedule</Modal.Name>
        <Button onClick={() => onRescheduleBtnClick(note.day.addOnClone(1, "day"))}>Tomorrow</Button>
        <Button onClick={() => onRescheduleBtnClick(note.day.addOnClone(1, "week"))}>Next Week</Button>
      </Modal.Section>

      {/* delete */}
      <Modal.Section className={bem("delete")}>
        <Modal.Name>Delete</Modal.Name>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}), {
  sidebarLayout: true,
});