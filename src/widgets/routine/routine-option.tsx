/** @jsxImportSource @emotion/react */
import { executeRoutineNotesSynchronize } from '@entities/note-synchronize';
import { RoutineDto, RoutineRepository } from '@entities/routine';
import { useRoutineNote } from "@features/note";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task-el';
import { Button } from '@shared/components/Button';
import { doConfirm } from '@shared/components/modal/confirm-modal';
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { dr } from '@shared/daily-routine-bem';
import { Notice } from "obsidian";
import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import { saveRoutine } from './model/save-routine';


interface Props {
  routine: RoutineDto;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: Props) => {
  const bem = useMemo(() => dr("routine-option"), []);
  const { note, setNote } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const id = useMemo(() => originalRoutine.name, [originalRoutine.name]);


  // modal.onClose
  useEffect(() => { modal.onClose(async () => {
    const newNote = await saveRoutine(note, routine);
    setNote(newNote);
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
      root: note.root.filter(task => task.name !== routine.name)
    });
    executeRoutineNotesSynchronize();
    modal.closeWithoutOnClose();
  }, [id, modal, note, routine.name, setNote])

  return (
    <Modal header='Routine Option' modal={modal}>
      <Modal.Separator edge />
      
      {/* name */}
      <TaskOption.Name
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
      <TaskOption.ShowOnCalendar
        value={routine.properties.showOnCalendar}
        onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
      />
      <Modal.Separator />

      {/* delete */}
      <Modal.Section className={bem("delete")} name='Delete'>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});