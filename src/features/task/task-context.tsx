import { RoutineNote } from "entities/routine-note";
import { Task } from "entities/routine-note";
///////////////////////////////////////////////////////
import React, { Dispatch, SetStateAction, useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview
} from "react-dnd-multi-backend";
import { createUseStateSyncedStore, UseStateRv } from "shared/zustand/create-use-state-synced-store";



const {StoreProvider, useStoreHook} = createUseStateSyncedStore<RoutineNote>();


const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { 
        enableMouseEvents: false,
        delayTouchStart: 500
      },
      preview: true,
      transition: TouchTransition
    }
  ],
};


interface TaskContextProps {
  useRoutineNoteState: UseStateRv<RoutineNote>;
  children: React.ReactNode;
}
export const TaskContext = ({ useRoutineNoteState, children }: TaskContextProps) => {
  return (
    <StoreProvider useState={useRoutineNoteState}>
      <DndProvider options={HTML5toTouch}>
        {children}
        <Preview>{
          ({item, itemType, monitor, ref, style}) => {
            // @ts-ignore
            const task = item?.task as Task;
            return <div className="item-list__item" style={style}>{task.name}</div>
          }}
        </Preview>
      </DndProvider>
    </StoreProvider>
  )
}

export const useRoutineNoteState = useStoreHook;