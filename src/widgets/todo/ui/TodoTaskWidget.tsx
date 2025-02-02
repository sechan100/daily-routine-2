import { noteRepository, TaskEntity, TaskGroup, TodoTask } from "@entities/note";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useTodoOptionModal } from './todo-option';
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { useRoutineNote } from "@features/note";
import { rescheduleTodo } from "../reschedule-todo";
import { Menu, Notice } from "obsidian";
import { Day } from "@shared/period/day";
import { changeTaskState } from "@features/task-el/model/change-task-state";


interface TodoTaskProps {
  task: TodoTask;
  parent: TaskGroup | null;
}
export const TodoTaskWidget = React.memo(({ task, parent }: TodoTaskProps) => {
  const TodoOptionModal = useTodoOptionModal();
  const { note, setNote } = useRoutineNote();


  const rescheduleTask = useCallback(async (destDay: Day) => {
    const rescheduleConfirm = await doConfirm({
      title: "Res schedule Todo",
      confirmText: "Reschedule",
      description: `Are you sure you want to reschedule '${task.name}' to ${destDay.format()}?`,
      confirmBtnVariant: "accent",
    })
    if(!rescheduleConfirm) return;

    const todoDeletedNote = await rescheduleTodo(note, task.name, destDay);
    setNote(todoDeletedNote);
    new Notice(`Todo ${task.name} rescheduled to ${destDay.format()}.`);
  }, [note, setNote, task.name]);
  

  const deleteTask = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: "Delete Todo",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${task.name}'?`,
      confirmBtnVariant: "destructive",
    })
    if(!deleteConfirm) return;

    const newNote = TaskEntity.removeTask(note, task.name);
    setNote(newNote);
    await noteRepository.update(newNote);
    new Notice(`Todo ${task.name} deleted.`);
  }, [note, setNote, task.name])

  
  const onOptionMenu = useCallback((m: Menu) => {
    m.addItem(i => {
      i.setTitle(`Todo: ${task.name}`);
      i.setIcon("info");
    })
    m.addSeparator();


    m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(() => TodoOptionModal.open({ todo: task }))
    })

    m.addItem(i => {
      i.setTitle("Check task as failed");
      i.setIcon("cross");
      i.onClick(async () => {
        const newNote = await changeTaskState(note, task.name, "failed");
        setNote(newNote);
      });
    })

    m.addItem(i => {
      i.setTitle("Reschedule Todo To Tomorrow");
      i.setIcon("calendar");
      i.onClick(() => rescheduleTask(note.day.clone(m=>m.add(1, "day"))));
    })

    m.addItem(i => {
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(deleteTask);
    })
  }, [TodoOptionModal, deleteTask, note, rescheduleTask, setNote, task])

  return (
    <>
      <BaseTaskFeature 
        task={task}
        parent={parent}
        className="dr-todo-task"
        onOptionMenu={onOptionMenu}
      />
      <TodoOptionModal />
    </>
  )
});