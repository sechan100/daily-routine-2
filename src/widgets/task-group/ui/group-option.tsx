/** @jsxImportSource @emotion/react */
import { groupRepository, RoutineGroup } from '@entities/routine';
import { groupReducer, GroupReducer } from '@features/group';
import { useRoutineMutationMerge } from '@features/merge-note';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { Notice } from 'obsidian';
import { useCallback, useMemo, useReducer } from "react";
import { changeGroupName } from '../change-group-name';
import { groupNameErrorMessage, validateGroupName } from '../validate-group-name';
import { t } from '@shared/i18n';


interface Props {
  group: RoutineGroup;
  modal: ModalApi;
}
export const useGroupOptionModal = createModal(({ modal, group: originalGroup}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [group, dispatch] = useReducer<GroupReducer>(groupReducer, originalGroup);
  const originalName = useMemo(() => originalGroup.name, [originalGroup.name]);

  const onSaveBtnClick = useCallback(async () => {
    const newName = group.name.trim();
    if(originalName !== newName){
      try {
        const existingNames = (await groupRepository.loadAll()).map(g => g.name);
        const validation = validateGroupName(newName, existingNames);
        if(validation.isErr()){
          new Notice(groupNameErrorMessage(validation.error, newName));
          return;
        }
        await changeGroupName(originalName, validation.value);
      } catch(e) {
        console.error("Failed to rename group.", e);
        new Notice(t("tasks.group.renameFailed", { name: originalName }));
        return;
      }
    }
    // await groupRepository.update(group);
    void mergeNotes();
    modal.close();
  }, [group.name, originalName, mergeNotes, modal]);


  return (
    <Modal header={t("tasks.group.editTitle")} modal={modal}>
      <Modal.Separator edgeWithtransparent />
      
      {/* name */}
      <Modal.NameSection
        value={group.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
      />
      <Modal.Separator />

      {/* save */}
      <Modal.SaveBtn
        disabled={group.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />

    </Modal>
  )
}, {
  // 입력 항목이 적어 화면을 덮는 큰 모달 대신 작은 모달로 띄운다.
  sidebarLayout: false,
});