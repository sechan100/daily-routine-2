/** @jsxImportSource @emotion/react */
import { executeRoutineNotesSynchronize } from '@entities/note-synchronize';
import { Routine, RoutineRepository } from '@entities/routine';
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


const bem = dr("routine-option");

interface Props {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: Props) => {
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const { note, setNote } = useRoutineNote();
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine.name]);

  const onSaveBtnClick = useCallback(async () => {
    // change name
    if(routine.name.trim() !== "" && originalName !== routine.name){
      await RoutineRepository.changeName(originalName, routine.name);
    }
    await RoutineRepository.update(routine);
  }, [originalName, routine]);

  const onDeleteBtnClick = useCallback(async (e: React.MouseEvent) => {
    const deleteConfirm = await doConfirm({
      title: "Delete Routine",
      confirmText: "Delete",
      description: `Are you sure you want to delete '${routine.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if(!deleteConfirm) return;
    
    RoutineRepository.delete(originalName);
    new Notice(`Routine ${routine.name} deleted.`);
    setNote({
      ...note,
      children: note.children.filter(task => task.name !== routine.name)
    });
    executeRoutineNotesSynchronize();
    modal.closeWithoutOnClose();
  }, [originalName, modal, note, routine.name, setNote])

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

      {/* save */}
      <Modal.Section>
        <Button
          css={{ width: "100%" }}
          disabled={routine.name.trim() === ""}
          variant={routine.name.trim() === "" ? "disabled" : "accent"}
          onClick={onSaveBtnClick}
        >
          Save
        </Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});