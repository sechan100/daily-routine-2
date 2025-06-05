/** @jsxImportSource @emotion/react */
import { RoutineGroup, routineGroupService } from '@/entities/routine-like';
import { createModal, ModalApi } from '@/shared/components/modal/create-modal';
import { Modal } from '@/shared/components/modal/styled';
import { useCallback, useMemo, useReducer } from "react";
import { useRoutineNoteStoreActions } from '../../model/use-routine-note';
import { GroupReducer, groupReducer } from './group-reducer';


interface Props {
  group: RoutineGroup;
  modal: ModalApi;
}
export const useGroupOptionModal = createModal(({ modal, group: originalGroup }: Props) => {
  const { merge } = useRoutineNoteStoreActions();
  const [group, dispatch] = useReducer<GroupReducer>(groupReducer, originalGroup);
  const originalName = useMemo(() => originalGroup.name, [originalGroup.name]);

  const onSaveBtnClick = useCallback(async () => {
    if (group.name.trim() !== "" && originalName !== group.name) {
      await routineGroupService.changeName(originalName, group.name);
    }
    merge();
    modal.close();
  }, [group.name, originalName, merge, modal]);


  return (
    <Modal header='Group option' modal={modal}>
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
  sidebarLayout: true,
});