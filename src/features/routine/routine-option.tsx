/** @jsxImportSource @emotion/react */
import { routineManager } from '@entities/routine';
import { Routine } from '@entities/routine';
import { Notice } from "obsidian";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { ActiveCriteriaOption } from "./ui/ActiveCriteriaOption";
import { Button } from '@shared/components/Button';
import { TextEditComponent } from '@shared/components/TextEditComponent';
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
export const useRoutineOptionModal = createModal(({ routine: originalRoutine, modal}: RoutineOptionModalProps) => {
  const bem = useMemo(() => dr("routine-option"), []);
  const [ routine, setRoutine ] = useState<Routine>(originalRoutine);
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine]);
  const { note, setNote } = useRoutineNote();


  // modal.onClose
  useEffect(() => { modal.onClose(async () => {
    const newNote = { ...note };
    let requeireSync = false;

    if(originalName !== routine.name && routine.name.trim() !== ""){
      await routineManager.rename(originalName, routine.name);
      newNote.tasks.forEach(task => {
        if(task.name === originalName){
          task.name = routine.name;
        }
      });
    }

    if(routine.properties !== originalRoutine.properties){
      await routineManager.editProperties(originalName, routine.properties);
      requeireSync = true;
      // precondition: 해당 노트에는 이미 해당 루틴이 존재했다고 가정하고, 루틴이 노트에서 빠지는 경우만 처리함
      if(!routineManager.isRoutineDueTo(routine, note.day)){
        newNote.tasks = newNote.tasks.filter(task => task.name !== routine.name);
      }
    }

    setNote(newNote);

    if(requeireSync) executeRoutineNotesSynchronize();
    
  })}, [modal, note, originalName, originalRoutine.properties, routine, setNote]);
  

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
            variant={routine.properties.activeCriteria === "week" ? "accent" : "primary"} 
            onClick={() => setProperties({activeCriteria: "week"})}
          >Week
          </Button>
          <Button
            variant={routine.properties.activeCriteria === "month" ? "accent" : "primary"}
            onClick={() => setProperties({activeCriteria: "month"})}
          >Month
          </Button>
        </nav>
      </Modal.Section>
      <ActiveCriteriaOption
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