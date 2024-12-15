/** @jsxImportSource @emotion/react */
import { executeRoutineNotesSynchronize } from "@entities/note-synchronize";
import { RoutineEntity } from "@entities/routine";
import { useRoutineNote } from "@features/note";
import { RoutineOption, routineReducer, RoutineReducer } from "@features/routine";
import { TaskOption } from '@features/task-el';
import { Button } from "@shared/components/Button";
import { createModal, ModalApi } from "@shared/components/modal/create-modal";
import { Modal } from "@shared/components/modal/styled";
import { dr } from "@shared/daily-routine-bem";
import { Notice } from "obsidian";
import { useCallback, useMemo, useReducer } from "react";


interface StartRoutineModalProps {
  modal: ModalApi;
}
export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
  const { note, setNote } = useRoutineNote();
  const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, RoutineEntity.DEFAULT_ROUTINE());

  const onSaveBtnClick = useCallback(async () => {
    // try {
    //   const noteDomain = RoutineNote.fromJSON(note);
    //   const task = RoutineTask.fromRoutine(routine);
    //   noteDomain.addTask();
      
    //   executeRoutineNotesSynchronize();
    //   modal.close();
    //   new Notice(`Routine '${routine.name}' started! 🎉`);
    // } catch(e) {
    //   new Notice(e.message);
    // }
  }, []);


  const bem = useMemo(() => dr("start-new-routine"), []);
  return (
    <Modal header="Start New Routine" className={bem()} modal={modal}>
      <Modal.Separator edge />

      {/* name */}
      <TaskOption.Name
        value={routine.name}
        onChange={name => dispatch({ type: "SET_NAME", payload: name })}
        placeholder="New Daily Routine"
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