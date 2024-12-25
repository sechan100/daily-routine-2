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
import { fileAccessor } from "@shared/file/file-accessor";

interface RoutineTaskProps {
  task: RoutineTask;
  parent: TaskGroup | null;
}
export const RoutineTaskWidget = React.memo(({ task, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const { mergeNotes } = useRoutineMutationMerge();
  const { note, setNote } = useRoutineNote();

  const finishRoutine = useCallback(async () => {
    const finishConfirm = await doConfirm({
      title: "Finish Routine",
      confirmText: "Finish",
      description: `Are you sure you want to finish the routine ${task.name}?`,
      confirmBtnVariant: "accent"
    })
    if(!finishConfirm) return;
    
    await routineRepository.finish(task.name);
    mergeNotes();
    new Notice(`Routine ${task.name} has been finished 🪄`);
  }, [mergeNotes, task.name])

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
      i.setTitle("Finish");
      i.setIcon("alarm-clock-off");
      i.onClick(finishRoutine);
    })
  }, [RoutineOptionModal, finishRoutine, note, setNote, task.name])
  
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