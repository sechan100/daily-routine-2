/** @jsxImportSource @emotion/react */
import { Routine, RoutineEntity, routineRepository } from '@entities/routine';
import { useRoutineMutationMerge } from '@features/merge-note';
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { Notice } from 'obsidian';
import { useCallback, useMemo, useReducer, useState } from "react";


const nameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "duplicated": return `Routine '${name}' already exists.`;
    case "contains-invalid-characters": return "Routine name cannot contain : / \\ # [ ] | ^";
    default: return "Invalid routine name.";
  }
}


interface Props {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine.name]);
  const [tagsText, setTagsText] = useState((originalRoutine.properties.tags ?? []).join(", "));

  const onSaveBtnClick = useCallback(async () => {
    const isRename = originalName !== routine.name;
    if(isRename){
      const existingNames = (await routineRepository.loadAll()).map(r => r.name);
      const validation = RoutineEntity.validateName({ name: routine.name, existingNames });
      if(validation.isErr()){
        new Notice(nameErrorMessage(validation.error, routine.name));
        return;
      }
    }
    const tagsValidation = RoutineEntity.validateTags(tagsText.split(/[\s,]+/).filter(t => t !== ""));
    if(tagsValidation.isErr()){
      new Notice(`Invalid tags: ${tagsValidation.error}`);
      return;
    }
    const newRoutine = {
      ...routine,
      properties: { ...routine.properties, tags: tagsValidation.value }
    };
    try {
      if(isRename){
        await routineRepository.changeName(originalName, routine.name);
      }
      await routineRepository.update(newRoutine);
    } catch {
      new Notice(`Failed to save routine '${originalName}'.`);
      return;
    }
    void mergeNotes();
    modal.close();
  }, [mergeNotes, modal, originalName, routine, tagsText]);


  return (
    <Modal header='Routine option' modal={modal}>
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
        name='Show on calendar'
        value={routine.properties.showOnCalendar}
        onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
      />
      <Modal.Separator />

      {/* tags */}
      <Modal.NameSection
        name='Tags'
        value={tagsText}
        onChange={setTagsText}
        placeholder='tag1, tag2'
      />
      <Modal.Separator />

      {/* save */}
      <Modal.SaveBtn
        disabled={routine.name.trim() === ""}
        onSaveBtnClick={() => { void onSaveBtnClick(); }}
      />

    </Modal>
  )
}, {
  sidebarLayout: true,
});