/** @jsxImportSource @emotion/react */
import { useRoutineMutationMerge } from "@/entities/merge-note";
import { RoutineRepository } from "@/entities/routine-like";
import { createModal, ModalApi } from "@/shared/components/modal/create-modal";
import { Modal } from "@/shared/components/modal/styled";
import { dr } from "@/shared/utils/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer } from "react";
import { createNewRoutine } from "./create-routine";
import { RoutineReducer, routineReducer } from "./routine-reducer";
import { ActiveCriteria } from "./ActiveCriteria";


const bem = dr("start-new-routine");


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, createNewRoutine());

  const onSaveBtnClick = useCallback(async () => {
    await RoutineRepository.create(routine);
    mergeNotes();
    modal.close();
    new Notice(`Routine '${routine.name}' started! 🎉`);
  }, [mergeNotes, modal, routine]);

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
      <ActiveCriteria
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
      <Modal.Separator edgeWithtransparent />

      {/* save */}
      <Modal.SaveBtn
        disabled={routine.name.trim() === ""}
        onSaveBtnClick={onSaveBtnClick}
      />
    </Modal>
  )
}, {
  sidebarLayout: true,
});