// /** @jsxImportSource @emotion/react */
// import { routineService } from "@/entities/routine";
// import { createModal, ModalApi } from "@/shared/components/modal/create-modal-legacy";
// import { Modal } from "@/shared/components/modal/styled";
// import { dr } from "@/shared/utils/daily-routine-bem";
// import { Notice } from "obsidian";
// import { useCallback, useReducer } from "react";
// import { RecurrenceUnitControl } from "../../../features/routine/ui/RecurrenceUnitControl";
// import { useRoutineNoteStore } from "../../model/use-routine-note";
// import { createNewRoutine } from "./create-routine";
// import { RoutineReducer, routineReducer } from "./routine-reducer";


// const bem = dr("start-new-routine");


// interface StartRoutineModalProps {
//   modal: ModalApi;
// }
// export const useStartRoutineModal = createModal(({ modal }: StartRoutineModalProps) => {
//   const { merge } = useRoutineNoteStore(s => s.actions);
//   const [routine, dispatch] = useReducer<RoutineReducer>(routineReducer, createNewRoutine());

//   const onSaveBtnClick = useCallback(async () => {
//     await routineService.create(routine);
//     merge();
//     modal.close();
//     new Notice(`Routine '${routine.name}' started! 🎉`);
//   }, [merge, modal, routine]);

//   return (
//     <Modal header="Start new Routine" className={bem()} modal={modal}>
//       <Modal.Separator edgeWithTransparent />

//       {/* name */}
//       <Modal.NameSection
//         focus
//         value={routine.name}
//         onChange={name => dispatch({ type: "SET_NAME", payload: name })}
//         placeholder="New routine"
//       />
//       <Modal.Separator />

//       {/* active criteria */}
//       <RecurrenceUnitControl
//         routine={routine}
//         setProperties={properties => dispatch({ type: "SET_PROPERTIES", payload: properties })}
//       />
//       <Modal.Separator />

//       {/* show on calendar */}
//       <Modal.ToggleSection
//         name="Show on calendar"
//         value={routine.properties.showOnCalendar}
//         onChange={(showOnCalendar) => dispatch({ type: "SET_PROPERTIES", payload: { showOnCalendar } })}
//       />
//       <Modal.Separator edgeWithTransparent />

//       {/* save */}
//       <Modal.SaveBtn
//         disabled={routine.name.trim() === ""}
//         onSaveBtnClick={onSaveBtnClick}
//       />
//     </Modal>
//   )
// }, {
//   sidebarLayout: true,
// });