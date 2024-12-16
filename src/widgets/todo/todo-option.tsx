/** @jsxImportSource @emotion/react */
import { noteRepository, TaskEntity, TodoTask } from '@entities/note';
import { useRoutineNote } from '@features/note';
import { TaskOption } from "@features/task-el";
import { Button } from '@shared/components/Button';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { rescheduleTodo } from "./reschedule-todo";


interface TodoOptionModalProps {
  todo: TodoTask;
  modal: ModalApi;
}
export const useTodoOptionModal = createModal(memo(({ todo: propsTodo, modal }: TodoOptionModalProps) => {
  const bem = useMemo(() => dr("todo-option"), []);
  const { note, setNote } = useRoutineNote();
  const [ todo, setTodo ] = useState<TodoTask>(propsTodo);
  const originalName = useMemo(() => propsTodo.name, [propsTodo]);

  const onSave = useCallback(async () => {
    if(todo.name.trim() === "") return;
    const newNote = TaskEntity.updateTask(note, originalName, todo);
    setNote(newNote);
    await noteRepository.update(newNote);
    modal.close();
  }, [modal, note, originalName, setNote, todo]);


  const onRescheduleBtnClick = useCallback(async (destDay: Day) => {
    const rescheduleConfirm = await doConfirm({
      title: "Res schedule Todo",
      confirmText: "Reschedule",
      description: `Are you sure you want to reschedule '${todo.name}' to ${destDay.format()}?`,
      confirmBtnVariant: "accent",
    })
    if(!rescheduleConfirm) return;

    const todoDeletedNote = await rescheduleTodo(note, originalName, destDay);
    setNote(todoDeletedNote);
    new Notice(`Todo ${todo.name} rescheduled to ${destDay.format()}.`);
    modal.close();
  }, [modal, note, originalName, setNote, todo.name]);


  const onDeleteBtnClick = useCallback(async(e: React.MouseEvent) => {
    const deleteConfirm = await doConfirm({
      title: "Delete Todo",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${todo.name}'?`,
      confirmBtnVariant: "destructive",
    })
    if(!deleteConfirm) return;

    const newNote = TaskEntity.removeTask(note, todo.name);
    setNote(newNote);
    await noteRepository.update(newNote);
    modal.close();
    new Notice(`Todo ${todo.name} deleted.`);
  }, [modal, note, setNote, todo.name])


  return (
    <Modal header='Todo Option' modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={todo.name}
        onChange={name => setTodo(todo => ({ ...todo, name}))}
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
          <Button onClick={() => onRescheduleBtnClick(note.day.clone(m => m.add(1, "day")))}>Tomorrow</Button>
          <Button onClick={() => onRescheduleBtnClick(note.day.clone(m => m.add(1, "week")))}>Next Week</Button>
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
      <Modal.Separator edge />

      {/* save */}
      <Modal.Section>
        <Button
          css={{ width: "100%" }}
          disabled={todo.name.trim() === ""}
          variant={todo.name.trim() === "" ? "disabled" : "accent"}
          onClick={onSave}
        >
          Save
        </Button>
      </Modal.Section>
    </Modal>
  )
}), {
  sidebarLayout: true,
});