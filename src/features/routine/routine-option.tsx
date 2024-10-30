/** @jsxImportSource @emotion/react */
import { routineManager } from 'entities/routine';
import { Routine, RoutineProperties } from 'entities/routine';
import { Notice } from "obsidian";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { DaysOption } from "./DaysOption";
import { Button } from 'shared/components/Button';
import { TextEditComponent } from 'shared/components/TextEditComponent';
import { dr } from 'shared/daily-routine-bem';
import { openConfirmModal } from 'shared/components/modal/confirm-modal';
import { Modal } from 'shared/components/modal/styled';
import { createModal, ModalApi } from 'shared/components/modal/create-modal';
import { useRoutineNote } from 'entities/note';
import { registerRoutineNotesSynchronize } from 'entities/note-synchronize';




interface RoutineOptionModalProps {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ routine: propsRoutine, modal}: RoutineOptionModalProps) => {
  const bem = useMemo(() => dr("routine-option"), []);
  const [ routine, setRoutine ] = useState<Routine>(propsRoutine);
  const originalName = useMemo(() => propsRoutine.name, [propsRoutine]);
  const { note, setNote } = useRoutineNote();


  // modal.onClose
  useEffect(() => { modal.onClose(async () => {
    if(originalName !== routine.name && routine.name.trim() !== ""){
      await routineManager.rename(originalName, routine.name);
    }
    await routineManager.editProperties(originalName, routine.properties);

    registerRoutineNotesSynchronize(note => setNote(note), note.day);
    
  })}, [modal, note, originalName, routine, setNote]);
  

  const setProperties = useCallback((propertiesPartial: Partial<Routine["properties"]>) => {
    setRoutine({
      ...routine,
      properties: {
        ...routine.properties,
        ...propertiesPartial
      }
    });
  }, [routine]);


  const onDeleteBtnClick = useCallback((e: React.MouseEvent) => {
    const onConfirm = async () => {
      routineManager.delete(routine.name);
      new Notice(`Routine ${routine.name} deleted.`);

      registerRoutineNotesSynchronize(note => setNote(note), note.day);
      
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
      {/* name */}
      <Modal.Section className={bem("name")}>
        <Modal.Name>Name</Modal.Name>
        <TextEditComponent
          value={routine.name}
          onChange={name => setRoutine({...routine, name})} 
        />
      </Modal.Section>
      <Modal.Separator />

      {/* activeCriteria */}
      <Modal.Section className={bem("criteria")} >
        <Modal.Name>Active Criteria</Modal.Name>
        <nav className={bem("criteria-nav")}>
          <Button
            css={{marginRight: "0.5em"}}
            accent={routine.properties.activeCriteria === "week"} 
            onClick={() => setProperties({activeCriteria: "week"})}
          >Week
          </Button>
          <Button
            accent={routine.properties.activeCriteria === "month"}
            onClick={() => setProperties({activeCriteria: "month"})}
          >Month
          </Button>
        </nav>
      </Modal.Section>
      <DaysOption
        criteria={routine.properties.activeCriteria}
        css={{
          padding: "1em 0"
        }}
        className={bem("days")} 
        properties={routine.properties} 
        setProperties={setProperties}
      />
      <Modal.Separator />

      {/* delete */}
      <Modal.Section className={bem("delete")}>
        <Modal.Name>Delete</Modal.Name>
        <Button variant='destructive' onClick={onDeleteBtnClick}>Delete</Button>
      </Modal.Section>
    </Modal>
  )
}, {
  sidebarLayout: true,
});