/** @jsxImportSource @emotion/react */
import { executeRoutineNotesSynchronize } from '@entities/note-synchronize';
import { Routine, RoutineRepository, RoutineService } from '@entities/routine';
import { useRoutineNote } from "@features/note";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task';
import { Button } from '@shared/components/Button';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { Notice } from "obsidian";
import React, { useCallback, useEffect, useMemo, useReducer } from "react";


interface RoutineOptionModalProps {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: RoutineOptionModalProps) => {
  const bem = useMemo(() => dr("routine-option"), []);
  const { note, setNote } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const id = useMemo(() => originalRoutine.name, [originalRoutine.name]);


  // modal.onClose를 정의
  useEffect(() => { modal.onClose(async () => {
    const newNote = { ...note };
    newNote.tasks.flatMap(task => {
      if(task.name !== id) return task;
      if(RoutineService.isRoutineDueTo(routine, note.day)){
        return {
          ...task,
          name: routine.name,
        }
      }
      else {
        return [];
      }
    });
    setNote(newNote);

    await RoutineRepository.update(id, routine);
    executeRoutineNotesSynchronize();
  })}, [id, modal, note, routine, setNote]);


  const onDeleteBtnClick = useCallback(async (e: React.MouseEvent) => {
    const deleteConfirm = await doConfirm({
      title: "Delete Routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${routine.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if(!deleteConfirm) return;
    
    RoutineRepository.delete(id);
    new Notice(`Routine ${routine.name} deleted.`);
    setNote({
      ...note,
      tasks: note.tasks.filter(task => task.name !== routine.name)
    });
    executeRoutineNotesSynchronize();
    modal.closeWithoutOnClose();
  }, [id, modal, note, routine.name, setNote])

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