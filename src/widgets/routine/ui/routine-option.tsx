/** @jsxImportSource @emotion/react */
import { Routine, RoutineEntity, routineRepository } from '@entities/routine';
import { useRoutineMutationMerge, renameRoutineInNotes, runExclusiveWithMerges } from '@features/merge-note';
import { useRoutineNote } from '@features/note';
import { getActiveCriteriaError, RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { createModal, ModalApi } from '@shared/components/modal/create-modal';
import { Modal } from '@shared/components/modal/styled';
import { Notice } from 'obsidian';
import { useCallback, useMemo, useReducer, useState } from "react";
import { routineNameErrorMessage, routineTagsErrorMessage, validateRoutineName } from '../validate-routine-name';
import { t } from '@shared/i18n';


interface Props {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine}: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const { note } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine.name]);
  const [tagsText, setTagsText] = useState((originalRoutine.properties.tags ?? []).join(", "));
  const activeCriteriaError = getActiveCriteriaError(routine.properties);

  const onSaveBtnClick = useCallback(async () => {
    if(activeCriteriaError){
      new Notice(activeCriteriaError);
      return;
    }
    const newName = routine.name.trim();
    const isRename = originalName !== newName;
    if(isRename){
      let existingNames: string[];
      try {
        existingNames = (await routineRepository.loadAll()).map(r => r.name);
      } catch(e) {
        console.error("Failed to load routines.", e);
        new Notice(t("tasks.routine.loadFailed"));
        return;
      }
      const validation = validateRoutineName(newName, existingNames, note);
      if(validation.isErr()){
        new Notice(routineNameErrorMessage(validation.error, newName));
        return;
      }
    }
    const tagsValidation = RoutineEntity.validateTags(tagsText.split(/[\s,]+/).filter(t => t !== ""));
    if(tagsValidation.isErr()){
      new Notice(routineTagsErrorMessage(tagsValidation.error));
      return;
    }
    const newRoutine = {
      ...routine,
      name: newName,
      properties: { ...routine.properties, tags: tagsValidation.value }
    };
    try {
      if(isRename){
        // 파일 이름 변경과 노트 안의 task 이름 변경 사이에 병합이 끼어들면, 오늘 체크한 기록이 옛 이름으로 따로 남는다.
        await runExclusiveWithMerges(async () => {
          await routineRepository.changeName(originalName, newName);
          await renameRoutineInNotes(originalName, newName);
        });
      }
      await routineRepository.update(newRoutine);
    } catch(e) {
      console.error("Failed to save routine.", e);
      new Notice(t("tasks.routine.saveFailed", { name: originalName }));
      return;
    }
    void mergeNotes();
    modal.close();
  }, [activeCriteriaError, mergeNotes, modal, note, originalName, routine, tagsText]);


  return (
    <Modal header={t("tasks.routine.editTitle")} modal={modal}>
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
      <Modal.Separator />

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