import { RoutineTask, TaskGroup } from "@entities/note";
import { BaseTaskFeature } from "@features/task-el";
import React, { useCallback } from "react";
import { useRoutineOptionModal } from "./routine-option";
import { routineRepository } from "@entities/routine";
import { Menu, Notice } from "obsidian";
import { useRoutineMutationMerge } from "@features/merge-note";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { changeTaskState } from "@features/task-el/model/change-task-state";
import { useRoutineNote } from "@features/note";

interface RoutineTaskProps {
  task: RoutineTask;
  parent: TaskGroup | null;
}
export const RoutineTaskWidget = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const { mergeNote } = useRoutineMutationMerge();
  const { note, setNote } = useRoutineNote();

  const deleteRoutine = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: "Delete Routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${task.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if(!deleteConfirm) return;
    
    await routineRepository.delete(task.name);
    mergeNote();
    new Notice(`Routine ${task.name} deleted.`);
  }, [mergeNote, task.name])

  const onOptionMenu = useCallback((m: Menu) => {
    m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(async () => {
        const routine = await routineRepository.load(task.name);
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
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(deleteRoutine);
    })
  }, [RoutineOptionModal, deleteRoutine, note, setNote, task.name])
  
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