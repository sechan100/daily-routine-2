/** @jsxImportSource @emotion/react */
import { useRoutineMutationMerge } from '@/entities/merge-note';
import { Routine, RoutineService } from '@/entities/routine-like';
import { createModal, ModalApi } from '@/shared/components/modal/create-modal';
import { Modal } from '@/shared/components/modal/styled';
import { useCallback, useMemo, useReducer } from "react";
import { ActiveCriteria } from './ActiveCriteria';
import { RoutineReducer, routineReducer } from './routine-reducer';


interface Props {
  routine: Routine;
  modal: ModalApi;
}
export const useRoutineOptionModal = createModal(({ modal, routine: originalRoutine }: Props) => {
  const { mergeNotes } = useRoutineMutationMerge();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, originalRoutine);
  const originalName = useMemo(() => originalRoutine.name, [originalRoutine.name]);

  const onSaveBtnClick = useCallback(async () => {
    if (routine.name.trim() !== "" && originalName !== routine.name) {
      await RoutineService.changeName(originalName, routine.name);
    }
    await RoutineService.update(routine);
    mergeNotes();
    modal.close();
  }, [mergeNotes, modal, originalName, routine]);


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
      <ActiveCriteria
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