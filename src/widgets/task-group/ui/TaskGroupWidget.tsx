import { NoteEntity, noteRepository, TaskGroup, TaskGroupEntity } from "@entities/note"
import { BaseTaskGroupFeature } from "@features/task-el/ui/BaseTaskGroupFeature"
import { useGroupOptionModal } from "./group-option";
import { useRoutineNote } from "@features/note";
import { useCallback } from "react";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { doFlagConfirm } from "@shared/components/modal/flag-confirm-modal";
import { Menu, Notice } from "obsidian";
import { groupRepository, RoutineGroup } from "@entities/routine";
import { deleteGroup } from "../delete-group";
import { useRoutineMutationMerge } from "@features/merge-note";
import { ResultAsync } from "neverthrow";





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
      title: "Delete group",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${group.name}'?`,
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: "Delete all tasks in this group",
      }
    })
    if(!deleteConfirm.confirm) return;

    await deleteGroup(note, group.name, deleteConfirm.flag);
    mergeNotes();
    new Notice(`Group ${group.name} deleted.`);
  }, [group.name, note, mergeNotes])

  const removeRoutineFromNoteOnly = useCallback(async () => {
    const removeConfirm = await doFlagConfirm({
      title: "Remove group from this note",
      confirmText: "Remove",
      description: `Are you sure you want to remove '${group.name}'? This will only remove 'group task' in this note not the 'group' itself.`,
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: "Remove all tasks in this group from this note only",
      }
    })
    if(!removeConfirm.confirm) return;

    const newNote = TaskGroupEntity.deleteTaskGroup(note, group.name, removeConfirm.flag);
    setNote(newNote);
    await noteRepository.save(newNote);
  }, [group.name, note, setNote])

  
  const onOptionMenu = useCallback(async (m: Menu) => {
    const groupResult = await (ResultAsync.fromThrowable(async () => await groupRepository.load(group.name)))();
    const loadedGroup = groupResult.isOk() ? groupResult.value : null ;
    /**
     * 과거에 존재했던 group을 오늘날에 와서 삭제했을 때, 그 group이 존재하는 과거노트에서 groupOption을 열 수 있다.
     * 이 경우 현재는 존재하지 않는 group 대한 option을 열게되므로, 전체 group 영향을 미치는 옵션들은 보이면 안된다.
     */
    const isGroupExist = loadedGroup !== null;

    /**
     * ROUTINE GROUP INFO
     */
    m.addItem(i => {
      i.setTitle(`${!isGroupExist ? "(deleted) " : ""}Group: ${group.name}`);
      i.setIcon("info");
      i.setDisabled(!isGroupExist);
    })
    m.addSeparator();

    isGroupExist && m.addItem(i => {
      i.setTitle("Edit");
      i.setIcon("pencil");
      i.onClick(async () => {
        if(!loadedGroup) throw new Error("Group is not exist.");
        GroupOptionModal.open({ group: loadedGroup });
      })
    })

    m.addItem(i => {
      i.setTitle("Remove from this note only");
      i.setIcon("list-x");
      i.onClick(removeRoutineFromNoteOnly);
    })

    isGroupExist && m.addItem(i => {
      i.setTitle("Delete");
      i.setIcon("trash");
      i.onClick(doDeleteGroup);
    })

  }, [GroupOptionModal, doDeleteGroup, group.name, removeRoutineFromNoteOnly])
  

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