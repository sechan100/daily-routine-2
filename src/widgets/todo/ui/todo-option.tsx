/** @jsxImportSource @emotion/react */
import { NoteRepository, NoteService, TodoTask } from '@entities/note';
import { useRoutineNote } from '@features/note';
import { TaskOption } from "@features/task";
import { TodoValidation, todoValidator, VALID_TODO_VALIDATION } from "@features/todo";
import { Button } from '@shared/components/Button';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { rescheduleTodo } from "../model/reschedule-todo";


interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const bem = useMemo(() => dr("todo-option"), []);
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => propsTodo.name, [propsTodo]);

  const validation = useMemo(() => {
    const vs: TodoValidation[] = [
      todoValidator.name(todo.name, { note, originalName }),
    ];
    const invalid = vs.find(v => !v.isValid);
    return invalid ?? VALID_TODO_VALIDATION;
  }, [note, originalName, todo.name]);


  // modal.onClose시에 저장
  useEffect(() => modal.onClose(() => {
    if(!validation.isValid) return;

    const nameChanged = originalName !== todo.name;
    const showOnCalendarChanged = propsTodo.showOnCalendar !== todo.showOnCalendar;

    if(nameChanged || showOnCalendarChanged){
      const newNote = NoteService.editTodoTask(note, originalName, todo);
      NoteRepository.update(newNote);
      setNote(newNote);
    }
  }), [modal, note, originalName, propsTodo.showOnCalendar, setNote, todo, validation.isValid]);


  const onRescheduleBtnClick = useCallback(async (destDay: Day) => {
    const rescheduleConfirm = await doConfirm({
      title: "Res schedule Todo",
      confirmText: "Reschedule",
      description: `Are you sure you want to reschedule '${todo.name}' to ${destDay.getBaseFormat()}?`,
      confirmBtnVariant: "accent",
    })
    if(!rescheduleConfirm) return;

    const todoDeletedNote = await rescheduleTodo(note, originalName, destDay);
    setNote(todoDeletedNote);
    new Notice(`Todo ${todo.name} rescheduled to ${destDay.getBaseFormat()}.`);
    modal.closeWithoutOnClose();

  }, [modal, note, originalName, setNote, todo.name]);


  const onDeleteBtnClick = useCallback(async(e: React.MouseEvent) => {
    const deleteConfirm = await doConfirm({
      title: "Delete Todo",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${todo.name}'?`,
      confirmBtnVariant: "destructive",
    })
    if(!deleteConfirm) return;

    const deletedNote = NoteService.deleteTodoTask(note, originalName);
    NoteRepository.forceSave(deletedNote);
    setNote(deletedNote);
    modal.closeWithoutOnClose();
    new Notice(`Todo ${todo.name} deleted.`);

  }, [modal, note, originalName, setNote, todo.name])


  return (
    <Modal header='Todo Option' modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name}))}
        validation={validation}
      />
      <Modal.Separator />

      {/* reschedule */}
      <Modal.Section
        className={bem("reschedule")}
        name="Reschedule"
      >
        <div css={{
          display: "flex",
          flexDirection: "row",
          gap: "5px",
          "& > button": {
            fontSize: "0.9em",
          }
        }}>
          <Button onClick={() => onRescheduleBtnClick(note.day.add(1, "day"))}>Tomorrow</Button>
          <Button onClick={() => onRescheduleBtnClick(note.day.add(1, "week"))}>Next Week</Button>
        </div>
      </Modal.Section>
      <Modal.Separator />

      {/* show on calendar */}
      <TaskOption.ShowOnCalendar
        value={todo.showOnCalendar}
        onChange={(showOnCalendar) => setTodo(todo => ({...todo, showOnCalendar}))}
      />
      <Modal.Separator />

      {/* delete */}
      <Modal.Section 
        className={bem("delete")}
        name="Delete"
      >
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}), {
  sidebarLayout: true,
});