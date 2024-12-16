/** @jsxImportSource @emotion/react */
import { routineRepository } from "@entities/routine";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task-el';
import { Button } from "@shared/components/Button";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useReducer } from "react";
import { createNewRoutine } from "./create-routine";
import { useRoutineMutationMerge } from "@features/merge-note";


const bem = dr("start-new-routine");


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { mergeNote } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, createNewRoutine());

  const onSaveBtnClick = useCallback(async () => {
    await routineRepository.persist(routine);
    mergeNote();
    modal.close();
    new Notice(`Routine '${routine.name}' started! 🎉`);
  }, [mergeNote, modal, routine]);

  return (
    <Modal header="Start New Routine" className={bem()} modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        focus
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder="New Routine"
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
      <Modal.Separator edge />

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