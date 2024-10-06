import { Routine, routineManager } from "entities/routine";
//////////////////////
import { plugin } from "libs/plugin-service-locator";
import { Modal, TextComponent } from "obsidian";
import { createRoot } from "react-dom/client";
import { DaysOption } from "./routine-option";
import { DAY_OF_WEEKS, DayOfWeek } from "libs/day";
import React, { useRef, useState, useEffect, useReducer, memo, useCallback } from "react";


export class AddRoutineModal extends Modal {
  constructor() {
    super(plugin().app);
    const el = document.createElement('div');
    createRoot(el).render(<AddRoutineModalComponent modal={this} />);
    const content = document.createDocumentFragment();
    content.appendChild(el);
    super.setContent(content);
  }

}

const initialRoutine = {
  name: "new daily routine",
  properties: {
    dayOfWeeks: DAY_OF_WEEKS
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
        properties: { ...state.properties, dayOfWeeks: [...state.properties.dayOfWeeks, action.payload] }
      };
    case "DELETE_DAYS":
      return {
        ...state,
        properties: { ...state.properties, dayOfWeeks: state.properties.dayOfWeeks.filter(day => day !== action.payload) }
      };
    default:
      return state;
  }
};
class DaysOfWeeksDispatchSet extends Set {
  dispatch: React.Dispatch<RoutineReducerAction>;
  constructor(dispatch: React.Dispatch<RoutineReducerAction>) {
    super(DAY_OF_WEEKS);
    this.dispatch = dispatch;
  }
  override add = (value: DayOfWeek): this => {
    super.add(value);
    this.dispatch({type: "ADD_DAYS", payload: value});
    return this;
  }

  override delete = (value: DayOfWeek): boolean => {
    const result = super.delete(value);
    this.dispatch({type: "DELETE_DAYS", payload: value});
    return result;
  }
}

const AddRoutineModalComponent = memo(function AddRoutineModalComponent({ modal }: { modal: AddRoutineModal }) {
  const [routine, dispatch] = useReducer<Reducer>(routineReducer, initialRoutine);

  const createNewRoutine = useCallback(() => {
    routineManager.create(routine);
    modal.close();
  }, [modal, routine]);

  return (
    <div>
      <h4>Add New Routine</h4>
      <NameOption initialName="new daily routine" onChange={name => dispatch({type: "NAME", payload: name})} />
      <DaysOption daysSet={new DaysOfWeeksDispatchSet(dispatch)} />
      <button onClick={() => createNewRoutine()}>Save</button>
    </div>
  )
})

export const NameOption = React.memo(function NameOption({ initialName, onChange }: {initialName: string, onChange: (name: string) => void}){
  // 이름 수정
  const nameEditElRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(initialName);
  useEffect(() => {
    if(!nameEditElRef.current) return;
    const textComp = new TextComponent(nameEditElRef.current)
    .setValue(name)
    .onChange((value) => {
      setName(value);
      onChange(value);
    });
    textComp.inputEl.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dr-routine-modal__section dr-routine-modal__name">
      <h6>Name</h6>
      <div ref={nameEditElRef} />
    </div>
  )
})