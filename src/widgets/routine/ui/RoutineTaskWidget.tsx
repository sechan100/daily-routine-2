import { NoteEntity, RoutineTask, TaskEntity, TaskGroup } from "@entities/note";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useRoutineOptionModal } from "./routine-option";
import { routineRepository } from "@entities/routine";
import { Menu, Notice } from "obsidian";
import { useRoutineMutationMerge } from "@features/merge-note";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { changeTaskState } from "@features/task-el/model/change-task-state";
import { updateNote } from "@features/task-el/model/update-note";
import { useRoutineNote } from "@features/note";
import { ResultAsync } from "neverthrow";
import { t } from "@shared/i18n";

interface RoutineTaskProps {
  task: RoutineTask;
  parent: TaskGroup | null;
}
export const RoutineTaskWidget = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const { mergeNotes } = useRoutineMutationMerge();
  const noteStore = useRoutineNote();
  const { note } = noteStore;


  const removeRoutineFromNoteOnly = useCallback(async () => {
    const removeConfirm = await doConfirm({
      title: t("tasks.routine.removeFromNoteTitle"),
      confirmText: t("common.remove"),
      description: t("tasks.routine.removeFromNoteConfirm", { name: task.name }),
      confirmBtnVariant: "destructive"
    })
    if(!removeConfirm) return;

    try {
      // 확인창을 기다리는 동안 파일이 바뀌었을 수 있으므로, 파일의 최신 내용에서 이 task만 제거한다.
      const newNote = await updateNote(note, current => {
        return NoteEntity.findTask(current, task.name) ? TaskEntity.removeTask(current, task.name) : current;
      });
      noteStore.setNote(newNote);
    } catch(e) {
      console.error("Failed to remove routine task from note.", e);
      new Notice(t("tasks.routine.removeFromNoteFailed", { name: task.name }));
    }
  }, [note, noteStore, task.name])


  const deleteRoutine = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: t("tasks.routine.deleteTitle"),
      confirmText: t("common.delete"),
      description: t("tasks.routine.deleteConfirm", { name: task.name }),
      confirmBtnVariant: "destructive"
    })
    if(!deleteConfirm) return;

    try {
      await routineRepository.delete(task.name);
    } catch(e) {
      console.error("Failed to delete routine.", e);
      new Notice(t("tasks.routine.deleteFailed", { name: task.name }));
      return;
    }
    void mergeNotes();
    new Notice(t("tasks.routine.deleted", { name: task.name }));
  }, [mergeNotes, task.name])


  const onOptionMenu = useCallback(async (m: Menu) => {
    const routineResult = await (ResultAsync.fromThrowable(async () => await routineRepository.load(task.name)))();
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
      i.setTitle(t(isRoutineExist ? "tasks.menu.routineInfo" : "tasks.menu.routineInfoDeleted", { name: task.name }));
      i.setIcon("info");
      i.setDisabled(!isRoutineExist);
    })
    m.addSeparator();

    isRoutineExist && m.addItem(i => {
      i.setTitle(t("common.edit"));
      i.setIcon("pencil");
      i.onClick(async () => {
        RoutineOptionModal.open({ routine });
      })
    })

    task.state !== "failed" && m.addItem(i => {
      i.setTitle(t("tasks.menu.checkAsFailed"));
      i.setIcon("cross");
      i.onClick(async () => {
        try {
          const newNote = await changeTaskState(note, task.name, "failed");
          noteStore.setNote(newNote);
        } catch(e) {
          console.error("Failed to check task as failed.", e);
          new Notice(t("tasks.task.updateFailed", { name: task.name }));
        }
      });
    })

    m.addItem(i => {
      i.setTitle(t("tasks.menu.removeFromNoteOnly"));
      i.setIcon("list-x");
      i.onClick(removeRoutineFromNoteOnly);
    })

    isRoutineExist && m.addItem(i => {
      i.setTitle(t("common.delete"));
      i.setIcon("trash");
      i.onClick(deleteRoutine);
    })
  }, [RoutineOptionModal, deleteRoutine, note, noteStore, removeRoutineFromNoteOnly, task.name, task.state])
  

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