/** @jsxImportSource @emotion/react */
import { RoutineEntity, routineRepository } from "@entities/routine";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer, useState } from "react";
import { createNewRoutine } from "../create-routine";
import { useRoutineMutationMerge } from "@features/merge-note";


const bem = dr("start-new-routine");

const nameErrorMessage = (error: string, name: string): string => {
  switch(error){
    case "duplicated": return `Routine '${name}' already exists.`;
    case "contains-invalid-characters": return "Routine name cannot contain : / \\ # [ ] | ^";
    default: return "Invalid routine name.";
  }
}


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, createNewRoutine());
  const [tagsText, setTagsText] = useState("");

  const onSaveBtnClick = useCallback(async () => {
    const existingNames = (await routineRepository.loadAll()).map(r => r.name);
    const validation = RoutineEntity.validateName({ name: routine.name, existingNames });
    if(validation.isErr()){
      new Notice(nameErrorMessage(validation.error, routine.name));
      return;
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
      const created = await routineRepository.create(newRoutine);
      if(!created){
        new Notice(nameErrorMessage("duplicated", routine.name));
        return;
      }
    } catch {
      new Notice(`Failed to create routine '${routine.name}'.`);
      return;
    }
    void mergeNotes();
    modal.close();
    new Notice(`Routine '${routine.name}' started! 🎉`);
  }, [mergeNotes, modal, routine, tagsText]);

  return (
    <Modal header="Start new Routine" className={bem()} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        focus
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder="New routine"
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
        name="Show on calendar"
        value={routine.properties.showOnCalendar}
        onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
      />
      <Modal.Separator />

      {/* tags */}
      <Modal.NameSection
        name="Tags"
        value={tagsText}
        onChange={setTagsText}
        placeholder="tag1, tag2"
      />
      <Modal.Separator edgeWithtransparent />

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