import { NoteEntity, noteRepository, TaskGroup, TaskGroupEntity } from "@entities/note"
import { BaseTaskGroupFeature } from "@features/task-el/ui/BaseTaskGroupFeature"
import { useGroupOptionModal } from "./group-option";
import { useRoutineNote } from "@features/note";
import { useCallback } from "react";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { doFlagConfirm } from "@shared/components/modal/flag-confirm-modal";
import { Menu, Notice } from "obsidian";
import { groupRepository } from "@entities/routine";
import { deleteGroup } from "../delete-group";
import { useRoutineMutationMerge } from "@features/merge-note";





interface Props {
  group: TaskGroup;
}
export const TaskGroupWidget = ({
  group
}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const GroupOptionModal = useGroupOptionModal();
  const { note, setNote } = useRoutineNote();
  
  const doDeleteGroup = useCallback(async () => {
    const deleteConfirm = await doFlagConfirm({
      title: "Delete Group",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${group.name}'?`,
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: "Delete all tasks in this group",
      }
    })
    if(!deleteConfirm.confirm) return;

    const newNote = await deleteGroup(note, group.name, deleteConfirm.flag);
    setNote(newNote);
    mergeNotes();
    new Notice(`Group ${group.name} deleted.`);
  }, [group.name, note, setNote, mergeNotes])

  
  const onOptionMenu = useCallback((m: Menu) => {
    m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(async () => {
        const routineGroup = await groupRepository.load(group.name);
        GroupOptionModal.open({ group: routineGroup });
      })
    })
    m.addItem(i => {
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(doDeleteGroup);
    })
  }, [GroupOptionModal, doDeleteGroup, group.name])
  
  return (
    <>
      <BaseTaskGroupFeature
        onOptionMenu={onOptionMenu}
        group={group}
      />
      <GroupOptionModal />
    </>
  )
}