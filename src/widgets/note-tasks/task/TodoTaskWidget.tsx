// import { noteRepository, TaskEntity, TaskGroup, TodoTask } from "@/entities/note";
// import { checkCheckable } from '@/features/checkable';
// import { doConfirm } from "@/shared/components/modal/confirm-modal";
// import { Day } from "@/shared/period/day";
// import { Menu, Notice } from "obsidian";
// import React, { useCallback } from "react";
// import { useRoutineNoteStore } from "../../model/use-routine-note";
// import { BaseTaskFeature } from "../legacy/BaseTaskFeature";
// import { rescheduleTodo } from "./reschedule-todo";
// import { useTodoOptionModal } from './todo-option';


// interface TodoTaskProps {
//   task: TodoTask;
//   parent: TaskGroup | null;
// }
// export const TodoTaskWidget = React.memo(({ task, parent }: TodoTaskProps) => {
//   const TodoOptionModal = useTodoOptionModal();
//   const { note, setNote } = useRoutineNoteStore();


//   const rescheduleTask = useCallback(async (destDay: Day) => {
//     const rescheduleConfirm = await doConfirm({
//       title: "Reschedule todo",
//       confirmText: "Reschedule",
//       description: `Are you sure you want to reschedule '${task.name}' to ${destDay.format()}?`,
//       confirmBtnVariant: "accent",
//     })
//     if (!rescheduleConfirm) return;

//     const todoDeletedNote = await rescheduleTodo(note, task.name, destDay);
//     setNote(todoDeletedNote);
//     new Notice(`Todo ${task.name} rescheduled to ${destDay.format()}.`);
//   }, [note, setNote, task.name]);


//   const deleteTask = useCallback(async () => {
//     const deleteConfirm = await doConfirm({
//       title: "Delete todo",
//       confirmText: "Delete",
//       description: `Are you sure you want to delete '${task.name}'?`,
//       confirmBtnVariant: "destructive",
//     })
//     if (!deleteConfirm) return;

//     const newNote = TaskEntity.removeTask(note, task.name);
//     setNote(newNote);
//     await noteRepository.update(newNote);
//     new Notice(`Todo ${task.name} deleted.`);
//   }, [note, setNote, task.name])


//   const onOptionMenu = useCallback((m: Menu) => {
//     m.addItem(i => {
//       i.setTitle(`Todo: ${task.name}`);
//       i.setIcon("info");
//     })
//     m.addSeparator();


//     m.addItem(i => {
//       i.setTitle("Edit");
//       i.setIcon("pencil");
//       i.onClick(() => TodoOptionModal.open({ todo: task }))
//     })

//     m.addItem(i => {
//       i.setTitle("Check task as failed");
//       i.setIcon("cross");
//       i.onClick(async () => {
//         const newNote = await checkCheckable(note, task.name, "failed");
//         setNote(newNote);
//       });
//     })

//     m.addItem(i => {
//       i.setTitle("Reschedule todo to tomorrow");
//       i.setIcon("calendar");
//       i.onClick(() => rescheduleTask(note.day.clone(m => m.add(1, "day"))));
//     })

//     m.addItem(i => {
//       i.setTitle("Delete");
//       i.setIcon("trash");
//       i.onClick(deleteTask);
//     })
//   }, [TodoOptionModal, deleteTask, note, rescheduleTask, setNote, task])

//   return (
//     <>
//       <BaseTaskFeature
//         checkable={task}
//         parent={parent}
//         className="dr-todo-task"
//         onOptionMenu={onOptionMenu}
//       />
//       <TodoOptionModal />
//     </>
//   )
// });