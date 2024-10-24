/** @jsxImportSource @emotion/react */
import { Notice } from "obsidian";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { modalComponent, useModal } from 'shared/components/modal/modal-component';
import { dr } from 'shared/daily-routine-bem';
import { drEvent } from 'shared/event';
import { openConfirmModal } from 'shared/components/modal/confirm-modal';
import { Modal } from 'shared/components/modal/styled';
import { RoutineNote, routineNoteService, TodoTask } from 'entities/note';
import { Day } from 'shared/day';




interface TodoOptionModalProps {
  note: RoutineNote;
  todo: TodoTask;
  onDeleted: (todoDeletedNote: RoutineNote) => void;
}
export const openTodoOptionModal = modalComponent(React.memo((props: TodoOptionModalProps) => {
  const [ todo, setTodo ] = useState<TodoTask>(props.todo);
  // original routine name: 변경 사항을 저장하기 위해서 기존 identifier가 필요함
  const originalNameRef = useRef(props.todo.name);  
  const modal = useModal();

  const emit = useCallback((...day: Day[]) => {
    drEvent.emit("updateNoteDependents", {
      days: [props.note.day, ...day],
    });
  }, [props.note]);

  // modal이 닫힐 때 저장
  useEffect(() => {
    modal.onClose = () => {
      const originalName = originalNameRef.current;
      if(todo.name.trim() !== ""){
        routineNoteService.editTodoTask(props.note, originalName, todo);
      }
      emit();
    }
  }, [emit, modal, props, todo]);

  
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
      const deletedNote = routineNoteService.deleteTodoTask(props.note, props.todo);
      props.onDeleted(deletedNote);
      emit();
      // 삭제되었기 때문에 modal이 닫을 때 저장하는 로직을 초기화하고 닫음.
      modal.onClose = () => {};
      modal.close();
      new Notice(`Todo ${todo.name} deleted.`);
    }

    openConfirmModal({
      onConfirm,
      className: bem("delete-confirm-modal"),
      confirmText: "Delete",
      description: `Are you sure you want to delete '${todo.name}'?`,
      confirmBtnVariant: "destructive"
    })
  }, [bem, emit, modal, props, todo.name])



  if(!todo) return <div>Loading...</div>
  return (
    <Modal header='Todo Option'>
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