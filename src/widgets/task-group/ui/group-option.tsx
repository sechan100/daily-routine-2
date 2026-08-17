/** @jsxImportSource @emotion/react */
import { groupRepository, RoutineGroup, RoutineGroupEntity } from '@entities/routine';
import { groupReducer, GroupReducer } from '@features/group';
import { useRoutineMutationMerge } from '@features/merge-note';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { err, ok, Result } from 'neverthrow';
import { Notice } from 'obsidian';
import { useCallback, useMemo, useReducer } from "react";
import { changeGroupName } from '../change-group-name';


const validateGroupName = (name: string, existingNames: string[]): Result<string, string> => {
  return RoutineGroupEntity.validateName(name, existingNames)
  .andThen(n => n.startsWith(RoutineGroupEntity.UNGROUPED_NAME) ? err('invalid-name') : ok(n))
  // 괄호로 감싸진 이름은 노트 포맷을 깨트린다.
  .andThen(n => /^\(.*\)$/.test(n) ? err('invalid-name') : ok(n));
}

const nameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "duplicated": return `Group '${name}' already exists.`;
    case "contains-invalid-characters": return "Group name cannot contain : / \\ # [ ] | ^";
    case "invalid-name": return `'${name}' cannot be used as a group name.`;
    default: return "Invalid group name.";
  }
}


interface Props {
  group: RoutineGroup;
  modal: ModalApi;
}
export const useGroupOptionModal = createModal(({ modal, group: originalGroup}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [group, dispatch] = useReducer<GroupReducer>(groupReducer, originalGroup);
  const originalName = useMemo(() => originalGroup.name, [originalGroup.name]);

  const onSaveBtnClick = useCallback(async () => {
    if(originalName !== group.name){
      const existingNames = (await groupRepository.loadAll()).map(g => g.name);
      const validation = validateGroupName(group.name, existingNames);
      if(validation.isErr()){
        new Notice(nameErrorMessage(validation.error, group.name));
        return;
      }
      try {
        await changeGroupName(originalName, group.name);
      } catch {
        new Notice(`Failed to rename group '${originalName}'.`);
        return;
      }
    }
    // await groupRepository.update(group);
    mergeNotes();
    modal.close();
  }, [group.name, originalName, mergeNotes, modal]);


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