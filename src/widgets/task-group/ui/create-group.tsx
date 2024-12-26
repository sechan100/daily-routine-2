/** @jsxImportSource @emotion/react */
import { groupRepository, RoutineGroup } from "@entities/routine";
import { groupReducer, GroupReducer } from "@features/group";
import { useRoutineMutationMerge } from "@features/merge-note";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer } from "react";


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
    await groupRepository.persist(group);
    mergeNotes();
    modal.close();
    new Notice(`Group '${group.name}' created.`);
  }, [group, mergeNotes, modal]);

  return (
    <Modal header="Create Group" className={bem()} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        focus
        value={group.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder="New Group"
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
  sidebarLayout: true,
});