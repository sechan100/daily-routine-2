/** @jsxImportSource @emotion/react */
import { groupRepository, RoutineGroup } from "@entities/routine";
import { groupReducer, GroupReducer } from "@features/group";
import { useRoutineMutationMerge } from "@features/merge-note";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer } from "react";
import { groupNameErrorMessage, validateGroupName } from "../validate-group-name";
import { t } from "@shared/i18n";


const bem = dr("create-group");

const createDefaultGroup = (): RoutineGroup => ({
  name: "",
  routineElementType: "routine-group",
  properties: {
    order: 0,
  },
});


interface CreateGroupModalProps {
  modal: ModalApi;
}
export const useCreateGroupModal = createModal(({ modal }: CreateGroupModalProps) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [group, dispatch] = useReducer<GroupReducer>(groupReducer, createDefaultGroup());

  const onSaveBtnClick = useCallback(async () => {
    let name: string;
    try {
      const existingNames = (await groupRepository.loadAll()).map(g => g.name);
      const validation = validateGroupName(group.name, existingNames);
      if(validation.isErr()){
        new Notice(groupNameErrorMessage(validation.error, group.name.trim()));
        return;
      }
      name = validation.value;

      // 검증은 공백을 제거한 이름으로 하므로, 저장도 같은 이름으로 해야 한다.
      const created = await groupRepository.persist({ ...group, name });
      if(!created){
        new Notice(groupNameErrorMessage("duplicated", name));
        return;
      }
    } catch(e) {
      console.error("Failed to create group.", e);
      new Notice(t("tasks.group.createFailed", { name: group.name.trim() }));
      return;
    }
    // 병합은 큐에서 모든 미래 노트를 돌므로 기다리지 않는다. (다른 모달과 같은 방식)
    void mergeNotes();
    modal.close();
    new Notice(t("tasks.group.created", { name }));
  }, [group, mergeNotes, modal]);

  return (
    <Modal header={t("tasks.group.createTitle")} className={bem()} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        focus
        value={group.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder={t("tasks.group.newPlaceholder")}
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