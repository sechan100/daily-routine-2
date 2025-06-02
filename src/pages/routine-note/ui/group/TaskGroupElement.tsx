import { NoteRoutineGroup } from "@/entities/note";
import { routineGroupService } from "@/entities/routine-like";
import { doFlagConfirm } from "@/shared/components/modal/flag-confirm-modal";
import { ResultAsync } from "neverthrow";
import { Menu, Notice } from "obsidian";
import { useCallback } from "react";
import { useRoutineNoteStore, useRoutineNoteStoreActions } from "../../model/use-routine-note";
import { BaseTaskGroupFeature } from "../legacy/BaseTaskGroupFeature";
import { useGroupOptionModal } from "./group-option";


interface Props {
  group: NoteRoutineGroup;
}
export const TaskGroupElement = ({
  group
}: Props) => {
  const note = useRoutineNoteStore(s => s.note);
  const { merge } = useRoutineNoteStoreActions();
  const GroupOptionModal = useGroupOptionModal();

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
    if (!deleteConfirm.confirm) return;
    await routineGroupService.delete(group.name, deleteConfirm.flag);
    merge();
    new Notice(`Group ${group.name} deleted.`);
  }, [group.name, merge]);

  const onOptionMenu = useCallback(async (m: Menu) => {
    const groupResult = await (ResultAsync.fromThrowable(async () => await routineGroupService.load(group.name)))();
    const loadedGroup = groupResult.isOk() ? groupResult.value : null;
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
        if (!loadedGroup) throw new Error("Group is not exist.");
        GroupOptionModal.open({ group: loadedGroup });
      })
    })

    isGroupExist && m.addItem(i => {
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