import { Task } from "entities/routine-note";
///////////////////////////////////////////////////////
import React, { CSSProperties, useCallback, useMemo } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  // TouchTransition,
  // MouseTransition,
  MultiBackendOptions,
  createTransition,
} from "react-dnd-multi-backend";
import { Preview } from "react-dnd-preview";
import { DRAG_PRESS_DELAY } from "./constants";
import { TaskPreview } from "./Task";




interface PreviewContextProps {
  task: Task;
  style: CSSProperties;
}
const PreviewContext = ({ task, style }: PreviewContextProps) => {
  return <TaskPreview task={task} style={style} />
}



export const TaskDndContext = ({ children }: {children: React.ReactNode }) => {
  const [ backend, setBackend ] = React.useState<"touch" | "html5">('html5');


  const MouseTransition = useMemo(() => createTransition('mousedown', (event) => {
    const b = event.type.contains('mouse')
    if(b) setBackend('html5');
    return b;
  }), [setBackend])
  
  const TouchTransition = useMemo(() => createTransition('touchstart', (event) => {
    const b = event.type.contains('touch')
    if(b) setBackend('touch');
    return b;
  }), [setBackend])

  
  const HTML5toTouch: MultiBackendOptions = useMemo<MultiBackendOptions>(() => {
    return {
      backends: [
        {
          id: "html5",
          backend: HTML5Backend,
          transition: MouseTransition,
        },
        {
          id: "touch",
          backend: TouchBackend,
          options: {
            enableMouseEvents: false,
            delayTouchStart: DRAG_PRESS_DELAY,
            ignoreContextMenu: false
          },
          transition: TouchTransition
        }
      ],
    }
  }, [MouseTransition, TouchTransition])


  return (
      <DndProvider options={HTML5toTouch}>
        {children}
        {backend === 'touch' && <Preview>{ ({ item, style }) => {
          // @ts-ignore
          const task = item?.task as Task;
          return <PreviewContext task={task} style={style} />
        }}</Preview>}
      </DndProvider>
  )
}
