import { RoutineNote, Task } from "entities/routine-note";
import { createStoreContext } from "shared/create-store-context";
import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview
} from "react-dnd-multi-backend";
import { delay } from "lodash";



interface UseTaskStore {
  routineNote: RoutineNote;

}
const {Context, useStoreHook} = createStoreContext<RoutineNote, UseTaskStore>((note, set, get) => ({
  routineNote: note,
}))


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
  routineNote: RoutineNote;
  children: React.ReactNode;
}
export const TaskContext = ({ routineNote, children }: TaskContextProps) => {
  return (
    <Context initialData={routineNote}>
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
    </Context>
  )
}

export const useTaskStore = useStoreHook;