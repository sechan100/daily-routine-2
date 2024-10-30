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
import { routineNoteService, TodoTask, useRoutineNote } from 'entities/note';




interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  // original routine name: 변경 사항을 저장하기 위해서 기존 identifier가 필요함
  const originalNameRef = useRef(propsTodo.name);  
  const { note, setNote } = useRoutineNote();
  useEffect(() => {
    modal.onClose(() => {
      if(todo.name.trim() !== ""){
        const newNote = routineNoteService.editTodoTask(note, originalNameRef.current, todo);
        setNote(newNote);
      }
    })
  }, [modal, note, setNote, todo]);

  
  const onNameEditDone = useCallback((newName: string) => {
    setTodo({
      ...todo,
      name: newName
    })
  }, [todo]);



  // bem
  const bem = useMemo(() => dr("todo-option"), []);

  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const onConfirm = () => {
      const deletedNote = routineNoteService.deleteTodoTask(note, originalNameRef.current);
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
  }, [bem, modal, note, setNote, todo.name])



  if(!todo) return <div>Loading...</div>
  return (
    <Modal header='Todo Option' modal={modal}>
      {/* name */}
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={todo.name}
          onBlur={onNameEditDone} 
        />
      </Modal.Section>
      <Modal.Separator />

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