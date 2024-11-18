/** @jsxImportSource @emotion/react */
import { routineManager } from '@entities/routine';
import { Routine } from '@entities/routine';
import { Notice } from "obsidian";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import React from "react";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task';
import { Button } from '@shared/components/Button';
import { dr } from '@shared/daily-routine-bem';
import { openConfirmModal } from '@shared/components/modal/confirm-modal';
import { Modal } from '@shared/components/modal/styled';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { useRoutineNote } from '@entities/note';
import { executeRoutineNotesSynchronize } from '@entities/note-synchronize';


interface RoutineOptionModalProps {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: RoutineOptionModalProps) => {
  const bem = useMemo(() => dr("routine-option"), []);
  const { note, setNote } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);


  // modal.onClose를 정의
  useEffect(() => { modal.onClose(async () => {
    const id = originalRoutine.name;
    const newNote = { ...note };
    let requeireSync = false;

    if(id !== routine.name && routine.name.trim() !== ""){
      await routineManager.rename(id, routine.name);
      newNote.tasks.forEach(task => {
        if(task.name === id){
          task.name = routine.name;
        }
      });
    }

    if(routine.properties !== originalRoutine.properties){
      await routineManager.editProperties(id, routine.properties);
      requeireSync = true;
      // precondition: 해당 노트에는 이미 해당 루틴이 존재했다고 가정하고, 루틴이 노트에서 빠지는 경우만 처리함
      if(!routineManager.isRoutineDueTo(routine, note.day)){
        newNote.tasks = newNote.tasks.filter(task => task.name !== routine.name);
      }
    }

    setNote(newNote);
    if(requeireSync) executeRoutineNotesSynchronize();
  })}, [modal, note, originalRoutine, routine, setNote]);


  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const onConfirm = async () => {
      routineManager.delete(routine.name);
      new Notice(`Routine ${routine.name} deleted.`);

      setNote({
        ...note,
        tasks: note.tasks.filter(task => task.name !== routine.name)
      });

      executeRoutineNotesSynchronize();
      modal.closeWithoutOnClose();
    }

    openConfirmModal({
      onConfirm,
      className: bem("delete-confirm-modal"),
      confirmText: "Delete",
      description: `Are you sure you want to delete '${routine.name}'?`,
      confirmBtnVariant: "destructive"
    })
  }, [bem, modal, note, routine.name, setNote])

  return (
    <Modal header='Routine Option' modal={modal}>
      <Modal.Separator edge />
      <TaskOption.Name
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
      />
      <Modal.Separator />

      <RoutineOption.ActiveCriteria 
        routine={routine} 
        setProperties={properties => dispatch({ type: "SET_PROPERTIES", payload: properties })} 
      />
      <Modal.Separator />

      <Modal.Section className={bem("delete")} name='Delete'>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});