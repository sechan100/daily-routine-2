import { useRoutineMutationMerge } from "@/entities/merge-note";
import { NoteRepository, RoutineTask, TaskEntity, TaskGroup } from "@/entities/note";
import { RoutineRepository } from "@/entities/routine-like";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { ResultAsync } from "neverthrow";
import { Menu, Notice } from "obsidian";
import React, { useCallback } from "react";
import { useRoutineNoteStore } from "../../model/use-routine-note";
import { changeTaskState } from "../task-base/model/change-task-state";
import { BaseTaskFeature } from "../task-base/ui/BaseTaskFeature";
import { useRoutineOptionModal } from "./routine-option";

interface RoutineTaskProps {
  task: RoutineTask;
  parent: TaskGroup | null;
}
export const RoutineTaskElment = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const { mergeNotes } = useRoutineMutationMerge();
  const { note, setNote } = useRoutineNoteStore();


  const removeRoutineFromNoteOnly = useCallback(async () => {
    const removeConfirm = await doConfirm({
      title: "Remove routine from this note",
      confirmText: "Remove",
      description: `Are you sure you want to remove '${task.name}'? This will only remove 'routine task' in this note not the 'routine' itself.`,
      confirmBtnVariant: "destructive"
    })
    if (!removeConfirm) return;

    const newNote = TaskEntity.removeTask(note, task.name);
    setNote(newNote);
    await NoteRepository.save(newNote);
  }, [note, setNote, task.name])


  const deleteRoutine = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: "Delete routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete the routine ${task.name}?`,
      confirmBtnVariant: "destructive"
    })
    if (!deleteConfirm) return;

    await RoutineRepository.delete(task.name);
    mergeNotes();
    new Notice(`Routine '${task.name}' deleted.`);
  }, [mergeNotes, task.name])


  const onOptionMenu = useCallback(async (m: Menu) => {
    const routineResult = await (ResultAsync.fromThrowable(async () => await RoutineRepository.load(task.name)))();
    const routine = routineResult.isOk() ? routineResult.value : null;
    /**
     * 과거에 수행했던 routine을 오늘날에 와서 삭제했을 때, 그 routine을 수행했던 과거노트에서 routine option을 열 수 있다.
     * 이 경우 현재는 존재하지 않는 routine에 대한 option을 열게되므로, 전체 루틴에 영향을 미치는 옵션들은 보이면 안된다.
     */
    const isRoutineExist = routine !== null;

    /**
     * ROUTINE INFO
     */
    m.addItem(i => {
      i.setTitle(`${!isRoutineExist ? "(deleted) " : ""}Routine: ${task.name}`);
      i.setIcon("info");
      i.setDisabled(!isRoutineExist);
    })
    m.addSeparator();

    isRoutineExist && m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(async () => {
        RoutineOptionModal.open({ routine });
      })
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
      i.setTitle("Remove from this note only");
      i.setIcon("list-x");
      i.onClick(removeRoutineFromNoteOnly);
    })

    isRoutineExist && m.addItem(i => {
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(deleteRoutine);
    })
  }, [RoutineOptionModal, deleteRoutine, note, removeRoutineFromNoteOnly, setNote, task.name])


  return (
    <>
      <BaseTaskFeature
        parent={parent}
        className="dr-routine-task"
        task={task}
        onOptionMenu={onOptionMenu}
      />
      <RoutineOptionModal />
    </>
  )
});