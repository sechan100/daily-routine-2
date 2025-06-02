/** @jsxImportSource @emotion/react */
import { RoutineGroup, routineGroupService } from "@/entities/routine-like";
import { createModal, ModalApi } from "@/shared/components/modal/create-modal";
import { Modal } from "@/shared/components/modal/styled";
import { dr } from "@/shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer } from "react";
import { useRoutineNoteStore } from "../../model/use-routine-note";
import { groupReducer, GroupReducer } from "./group-reducer";


const bem = dr("create-group");

const createDefaultGroup = (): RoutineGroup => ({
  name: "",
  routineLikeType: "routine-group",
  properties: {
    order: 0,
  },
});


interface CreateGroupModalProps {
  modal: ModalApi;
}
export const useCreateGroupModal = createModal(({ modal }: CreateGroupModalProps) => {
  const { merge } = useRoutineNoteStore(s => s.actions);
  const [group, dispatch] = useReducer<GroupReducer>(groupReducer, createDefaultGroup());

  const onSaveBtnClick = useCallback(async () => {
    await routineGroupService.persist(group);
    merge();
    modal.close();
    new Notice(`Group '${group.name}' created.`);
  }, [group, merge, modal]);

  return (
    <Modal header="Create group" className={bem()} modal={modal}>
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