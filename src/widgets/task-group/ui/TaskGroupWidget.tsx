import { RoutineNote, TaskGroup, TaskGroupEntity } from "@entities/note"
import { BaseTaskGroupFeature } from "@features/task-el/ui/BaseTaskGroupFeature"
import { updateNote } from "@features/task-el/model/update-note";
import { useGroupOptionModal } from "./group-option";
import { useRoutineNote } from "@features/note";
import { useCallback } from "react";
import { doFlagConfirm } from "@shared/components/modal/flag-confirm-modal";
import { Menu, Notice } from "obsidian";
import { groupRepository } from "@entities/routine";
import { deleteGroup } from "../delete-group";
import { useRoutineMutationMerge } from "@features/merge-note";
import { ResultAsync } from "neverthrow";
import { t } from "@shared/i18n";





interface Props {
  group: TaskGroup;
}
export const TaskGroupWidget = ({
  group
}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const GroupOptionModal = useGroupOptionModal();
  const routineNoteStore = useRoutineNote();
  const { note } = routineNoteStore;
  const setNote = useCallback((newNote: RoutineNote) => routineNoteStore.setNote(newNote), [routineNoteStore]);


  const doDeleteGroup = useCallback(async () => {
    const deleteConfirm = await doFlagConfirm({
      title: t("tasks.group.deleteTitle"),
      confirmText: t("common.delete"),
      description: t("tasks.group.deleteConfirm", { name: group.name }),
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: t("tasks.group.deleteAllTasks"),
      }
    })
    if(!deleteConfirm.confirm) return;

    try {
      await deleteGroup(group.name, deleteConfirm.flag);
    } catch(e) {
      console.error("Failed to delete group.", e);
      new Notice(t("tasks.group.deleteFailed", { name: group.name }));
      // 일부만 삭제됐을 수 있으므로, 실패해도 저장소의 실제 상태를 노트에 반영한다.
      void mergeNotes();
      return;
    }
    void mergeNotes();
    new Notice(t("tasks.group.deleted", { name: group.name }));
  }, [group.name, mergeNotes])

  const removeRoutineFromNoteOnly = useCallback(async () => {
    const removeConfirm = await doFlagConfirm({
      title: t("tasks.group.removeFromNoteTitle"),
      confirmText: t("common.remove"),
      description: t("tasks.group.removeFromNoteConfirm", { name: group.name }),
      confirmBtnVariant: "destructive",
      flagOption: {
        defaultValue: false,
        text: t("tasks.group.removeAllTasks"),
      }
    })
    if(!removeConfirm.confirm) return;

    try {
      // 확인창을 기다리는 동안 파일이 바뀌었을 수 있으므로, 파일의 최신 내용에서 이 그룹만 제거한다.
      const newNote = await updateNote(note, current => TaskGroupEntity.deleteTaskGroup(current, group.name, removeConfirm.flag));
      setNote(newNote);
    } catch(e) {
      console.error("Failed to remove group from note.", e);
      new Notice(t("tasks.group.removeFromNoteFailed", { name: group.name }));
    }
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
      i.setTitle(t(isGroupExist ? "tasks.menu.groupInfo" : "tasks.menu.groupInfoDeleted", { name: group.name }));
      i.setIcon("info");
      i.setDisabled(!isGroupExist);
    })
    m.addSeparator();

    isGroupExist && m.addItem(i => {
      i.setTitle(t("common.edit"));
      i.setIcon("pencil");
      i.onClick(async () => {
        if(!loadedGroup) throw new Error("Group is not exist.");
        GroupOptionModal.open({ group: loadedGroup });
      })
    })

    m.addItem(i => {
      i.setTitle(t("tasks.menu.removeFromNoteOnly"));
      i.setIcon("list-x");
      i.onClick(removeRoutineFromNoteOnly);
    })

    isGroupExist && m.addItem(i => {
      i.setTitle(t("common.delete"));
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