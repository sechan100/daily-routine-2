/** @jsxImportSource @emotion/react */
import { Routine, routineRepository } from '@entities/routine';
import { useRoutineMutationMerge } from '@features/merge-note';
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { Button } from '@shared/components/Button';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { Notice } from "obsidian";
import React, { useCallback, useMemo, useReducer } from "react";


const bem = dr("routine-option");

interface Props {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: Props) => {
  const { mergeNote } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine.name]);

  const onSaveBtnClick = useCallback(async () => {
    if(routine.name.trim() !== "" && originalName !== routine.name){
      await routineRepository.changeName(originalName, routine.name);
    }
    await routineRepository.update(routine);
    mergeNote();
    modal.close();
  }, [mergeNote, modal, originalName, routine]);

  const onDeleteBtnClick = useCallback(async (e: React.MouseEvent) => {
    const deleteConfirm = await doConfirm({
      title: "Delete Routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${routine.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if(!deleteConfirm) return;
    
    await routineRepository.delete(originalName);
    mergeNote();
    modal.close();
    new Notice(`Routine ${routine.name} deleted.`);
  }, [routine.name, originalName, mergeNote, modal])

  return (
    <Modal header='Routine Option' modal={modal}>
      <Modal.Separator edgeWithtransparent />
      
      {/* name */}
      <Modal.NameSection
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
      />
      <Modal.Separator />

      {/* active criteria */}
      <RoutineOption.ActiveCriteria 
        routine={routine}
        setProperties={properties => dispatch({ type: "SET_PROPERTIES", payload: properties })} 
      />
      <Modal.Separator />

      {/* show on calendar */}
      <Modal.ToggleSection
        name='Show On Calendar'
        value={routine.properties.showOnCalendar}
        onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
      />
      <Modal.Separator />

      {/* delete */}
      <Modal.Section className={bem("delete")} name='Delete'>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        disabled={routine.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />

    </Modal>
  )
}, {
  sidebarLayout: true,
});