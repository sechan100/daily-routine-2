import { NoteRoutine, NoteRoutineGroup } from "@/entities/note";
import { routineService } from "@/entities/routine-like";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { Menu, Notice } from "obsidian";
import React, { useCallback } from "react";
import { checkCheckable } from "../../model/check-checkable";
import { useRoutineNoteStore, useRoutineNoteStoreActions } from "../../model/use-routine-note";
import { BaseTaskFeature } from "../legacy-dnd/BaseTaskFeature";
import { useRoutineOptionModal } from "./routine-option";

interface RoutineTaskProps {
  routine: NoteRoutine;
  parent: NoteRoutineGroup | null;
}
export const NoteRoutineElement = React.memo(({ routine, parent }: RoutineTaskProps) => {
  const RoutineOptionModal = useRoutineOptionModal();
  const note = useRoutineNoteStore(s => s.note);
  const { setNote, merge } = useRoutineNoteStoreActions();

  const deleteRoutine = useCallback(async () => {
    const deleteConfirm = await doConfirm({
      title: "Delete routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete the routine ${routine.name}?`,
      confirmBtnVariant: "destructive"
    })
    if (!deleteConfirm) return;

    await routineService.delete(routine.name);
    merge();
    new Notice(`Routine '${routine.name}' deleted.`);
  }, [merge, routine.name])


  const onOptionMenu = useCallback(async (m: Menu) => {
    const sourceRoutine = await routineService.load(routine.name);
    /**
     * 과거에 수행했던 routine을 오늘날에 와서 삭제했을 때, 그 routine을 수행했던 과거노트에서 routine option을 열 수 있다.
     * 이 경우 현재는 존재하지 않는 routine에 대한 option을 열게되므로, 전체 루틴에 영향을 미치는 옵션들은 보이면 안된다.
     */
    const isRoutineExist = routine !== null;

    /**
     * ROUTINE INFO
     */
    m.addItem(i => {
      i.setTitle(`${!isRoutineExist ? "(deleted) " : ""}Routine: ${routine.name}`);
      i.setIcon("info");
      i.setDisabled(!isRoutineExist);
    })
    m.addSeparator();

    isRoutineExist && m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(async () => {
        RoutineOptionModal.open({ routine: sourceRoutine });
      })
    })

    m.addItem(i => {
      i.setTitle("Check task as failed");
      i.setIcon("cross");
      i.onClick(async () => {
        const newNote = await checkCheckable(note, routine.name, "failed");
        setNote(newNote);
      });
    })

    isRoutineExist && m.addItem(i => {
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(deleteRoutine);
    })
  }, [routine, RoutineOptionModal, note, setNote, deleteRoutine])


  return (
    <>
      <BaseTaskFeature
        parent={parent}
        className="dr-routine-task"
        checkable={routine}
        onOptionMenu={onOptionMenu}
      />
      <RoutineOptionModal />
    </>
  )
});