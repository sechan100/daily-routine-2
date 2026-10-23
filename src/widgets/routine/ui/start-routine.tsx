/** @jsxImportSource @emotion/react */
import { RoutineEntity, routineRepository } from "@entities/routine";
import { useRoutineNote } from "@features/note";
import { getActiveCriteriaError, RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer, useState } from "react";
import { createNewRoutine } from "../create-routine";
import { routineNameErrorMessage, routineTagsErrorMessage, validateRoutineName } from "../validate-routine-name";
import { t } from "@shared/i18n";
import { useRoutineMutationMerge } from "@features/merge-note";


const bem = dr("start-new-routine");


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const { note } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, createNewRoutine());
  const [tagsText, setTagsText] = useState("");
  const activeCriteriaError = getActiveCriteriaError(routine.properties);

  const onSaveBtnClick = useCallback(async () => {
    if(activeCriteriaError){
      new Notice(activeCriteriaError);
      return;
    }
    let existingNames: string[];
    try {
      existingNames = (await routineRepository.loadAll()).map(r => r.name);
    } catch(e) {
      console.error("Failed to load routines.", e);
      new Notice(t("tasks.routine.loadFailed"));
      return;
    }
    const validation = validateRoutineName(routine.name, existingNames, note);
    if(validation.isErr()){
      new Notice(routineNameErrorMessage(validation.error, routine.name.trim()));
      return;
    }
    const name = validation.value;
    const tagsValidation = RoutineEntity.validateTags(tagsText.split(/[\s,]+/).filter(t => t !== ""));
    if(tagsValidation.isErr()){
      new Notice(routineTagsErrorMessage(tagsValidation.error));
      return;
    }
    const newRoutine = {
      ...routine,
      name,
      properties: { ...routine.properties, tags: tagsValidation.value }
    };
    try {
      const created = await routineRepository.create(newRoutine);
      if(!created){
        new Notice(routineNameErrorMessage("duplicated", name));
        return;
      }
    } catch(e) {
      console.error("Failed to create routine.", e);
      new Notice(t("tasks.routine.createFailed", { name }));
      return;
    }
    void mergeNotes();
    modal.close();
    new Notice(t("tasks.routine.started", { name }));
  }, [activeCriteriaError, mergeNotes, modal, note, routine, tagsText]);

  return (
    <Modal header={t("tasks.routine.startTitle")} className={bem()} modal={modal}>
      <Modal.Separator edgeWithtransparent />

      {/* name */}
      <Modal.NameSection
        focus
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder={t("tasks.routine.newPlaceholder")}
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
        name={t("common.showOnCalendar")}
        value={routine.properties.showOnCalendar}
        onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
      />
      <Modal.Separator />

      {/* tags */}
      <Modal.NameSection
        name={t("common.tags")}
        value={tagsText}
        onChange={setTagsText}
        placeholder={t("tasks.routine.tagsPlaceholder")}
      />
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        disabled={routine.name.trim() === "" || activeCriteriaError !== null}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  )
}, {
  sidebarLayout: true,
});