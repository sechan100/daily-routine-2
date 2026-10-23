import { NoteEntity, RoutineNote, TaskEntity, TaskGroup, TodoTask } from "@entities/note";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useTodoOptionModal } from './todo-option';
import { useRescheduleTodoModal } from './reschedule-todo-modal';
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { useRoutineNote } from "@features/note";
import { rescheduleTodo } from "../reschedule-todo";
import { Menu, Notice } from "obsidian";
import { Day } from "@shared/period/day";
import { formatFullDate, t } from "@shared/i18n";
import { changeTaskState } from "@features/task-el/model/change-task-state";
import { updateNote } from "@features/task-el/model/update-note";


interface TodoTaskProps {
  task: TodoTask;
  parent: TaskGroup | null;
}
export const TodoTaskWidget = React.memo(({ task, parent }: TodoTaskProps) => {
  const TodoOptionModal = useTodoOptionModal();
  const RescheduleTodoModal = useRescheduleTodoModal();
  const routineNoteStore = useRoutineNote();
  const { note } = routineNoteStore;
  const setNote = useCallback((newNote: RoutineNote) => routineNoteStore.setNote(newNote), [routineNoteStore]);
  const isPastNote = note.day.wholeDayDiff(Day.today()) < 0;


  const rescheduleTask = useCallback(async (destDay: Day) => {
    const rescheduleConfirm = await doConfirm({
      title: t("tasks.todo.rescheduleTitle"),
      confirmText: t("tasks.todo.reschedule"),
      description: t("tasks.todo.rescheduleConfirm", { name: task.name, date: formatFullDate(destDay) }),
      confirmBtnVariant: "accent",
    })
    if(!rescheduleConfirm) return;

    // 재조정할 수 없는 이유는 rescheduleTodo가 Notice로 알린다.
    const result = await rescheduleTodo(note, task.name, destDay);
    if(result.isErr()) return;
    setNote(result.value);
    new Notice(t("tasks.todo.rescheduled", { name: task.name, date: formatFullDate(destDay) }));
  }, [note, setNote, task.name]);
  

  const deleteTask = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: t("tasks.todo.deleteTitle"),
      confirmText: t("common.delete"),
      description: t("tasks.todo.deleteConfirm", { name: task.name }),
      confirmBtnVariant: "destructive",
    })
    if(!deleteConfirm) return;

    try {
      // 확인창을 기다리는 동안 파일이 바뀌었을 수 있으므로, 파일의 최신 내용에서 이 todo만 제거한다.
      const newNote = await updateNote(note, current => {
        return NoteEntity.findTask(current, task.name) ? TaskEntity.removeTask(current, task.name) : current;
      });
      setNote(newNote);
    } catch(e) {
      console.error("Failed to delete todo.", e);
      new Notice(t("tasks.todo.deleteFailed", { name: task.name }));
      return;
    }
    new Notice(t("tasks.todo.deleted", { name: task.name }));
  }, [note, setNote, task.name])

  
  const onOptionMenu = useCallback((m: Menu) => {
    m.addItem(i => {
      i.setTitle(t("tasks.menu.todoInfo", { name: task.name }));
      i.setIcon("info");
    })
    m.addSeparator();


    m.addItem(i => {
      i.setTitle(t("common.edit"));
      i.setIcon("pencil");
      i.onClick(() => TodoOptionModal.open({ todo: task }))
    })

    task.state !== "failed" && m.addItem(i => {
      i.setTitle(t("tasks.menu.checkAsFailed"));
      i.setIcon("cross");
      i.onClick(async () => {
        try {
          const newNote = await changeTaskState(note, task.name, "failed");
          setNote(newNote);
        } catch(e) {
          console.error("Failed to check task as failed.", e);
          new Notice(t("tasks.task.updateFailed", { name: task.name }));
        }
      });
    })

    m.addItem(i => {
      i.setTitle(t("tasks.menu.rescheduleTomorrow"));
      i.setIcon("calendar");
      i.onClick(() => rescheduleTask(note.day.clone(m=>m.add(1, "day"))));
    })

    m.addItem(i => {
      i.setTitle(t("tasks.menu.rescheduleTo"));
      i.setIcon("calendar-days");
      i.onClick(() => RescheduleTodoModal.open({ taskName: task.name }));
    })

    // 지난 날짜의 노트에서 끝내지 못한 todo는 오늘로 바로 가져올 수 있다.
    isPastNote && task.state === "un-checked" && m.addItem(i => {
      i.setTitle(t("tasks.menu.moveToToday"));
      i.setIcon("calendar-check");
      i.onClick(() => rescheduleTask(Day.today()));
    })

    m.addItem(i => {
      i.setTitle(t("common.delete"));
      i.setIcon("trash");
      i.onClick(deleteTask);
    })
  }, [RescheduleTodoModal, TodoOptionModal, deleteTask, isPastNote, note, rescheduleTask, setNote, task])

  return (
    <>
      <BaseTaskFeature 
        task={task}
        parent={parent}
        className="dr-todo-task"
        onOptionMenu={onOptionMenu}
      />
      <TodoOptionModal />
      <RescheduleTodoModal />
    </>
  )
});