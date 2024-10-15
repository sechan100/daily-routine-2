import { Routine, routineManager } from "entities/routine/routine";
//////////////////////
import { plugin } from "shared/plugin-service-locator";
import { Modal, TextComponent } from "obsidian";
import { createRoot } from "react-dom/client";
import { DaysOption } from "./DaysOption";
import { DAYS_OF_WEEK, DayOfWeek } from "shared/day";
import React, { useRef, useState, useEffect, useReducer, memo, useCallback } from "react";



export const openAddRoutineModal = () => {
  new AddRoutineModal().open();
}

// Obsidian Modal
class AddRoutineModal extends Modal {
  constructor() {
    super(plugin().app);
    const el = document.createElement('div');
    createRoot(el).render(<AddRoutineModalComponent modal={this} />);
    const content = document.createDocumentFragment();
    content.appendChild(el);
    super.setContent(content);
  }
}


type RoutineReducerAction = 
  | {type: "NAME", payload: string}
  | {type: "ADD_DAYS", payload: DayOfWeek}
  | {type: "DELETE_DAYS", payload: DayOfWeek}

type Reducer = (state: Routine, action: RoutineReducerAction)=>Routine;
const routineReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "NAME":
      return { ...state, name: action.payload };
    case "ADD_DAYS":
      return {
        ...state,
        properties: { ...state.properties, daysOfWeek: [...state.properties.daysOfWeek, action.payload] }
      };
    case "DELETE_DAYS":
      return {
        ...state,
        properties: { ...state.properties, daysOfWeek: state.properties.daysOfWeek.filter(day => day !== action.payload) }
      };
    default:
      return state;
  }
};

const defaultRoutine = {
  name: "new daily routine",
  properties: {
    order: 0,
    daysOfWeek: DAYS_OF_WEEK
  }
}
const AddRoutineModalComponent = memo(function AddRoutineModalComponent({ modal }: { modal: AddRoutineModal }) {
  const [routine, dispatch] = useReducer<Reducer>(routineReducer, defaultRoutine);

  // 이름 수정
  const nameEditElRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!nameEditElRef.current) return;
    const textComp = new TextComponent(nameEditElRef.current)
    .setValue(routine.name)
    .onChange((value) => {
      dispatch({type: "NAME", payload: value});
    });
    textComp.inputEl.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 루틴 생성
  const createNewRoutine = useCallback(() => {
    routineManager.create(routine);
    modal.close();
  }, [modal, routine]);

  // 요일 수정
  const onDaysChange = useCallback((action: "add" | "remove", day: DayOfWeek) => {
    if(action === "add"){
      dispatch({type: "ADD_DAYS", payload: day});
    } else {
      dispatch({type: "DELETE_DAYS", payload: day});
    }
  }, [])


  return (
    <div>
      <h4>Add New Routine</h4>
      {/* Name */}
      <div className="dr-routine-option__section dr-routine-option-name">
        <h6>Name</h6>
        <div ref={nameEditElRef} />
      </div>
      {/* Days */}
      <DaysOption className="routine" getDays={() => routine.properties.daysOfWeek} onDaysChange={onDaysChange}  />
      {/* Save */}
      <button onClick={() => createNewRoutine()}>Save</button>
    </div>
  )
})