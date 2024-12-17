/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useRef } from "react";
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
import { ElementPreview } from "./ElementPreview";
import { useDndScroll } from "../dnd/use-dnd-scroll";
import { useDragDropManager } from "react-dnd";
import { TaskElDragItem } from '../dnd/drag-item';
import { isNoteElement, isTaskGroup } from "@entities/note";


export const DELAY_TOUCH_START = 1000;


export const TaskDndContext = ({ children }: {children: React.ReactNode }) => {
  const [ backend, setBackend ] = React.useState<"touch" | "html5">('html5');

  const MouseTransition = useMemo(() => createTransition('mousedown', (event) => {
    const b = event.type.contains('mouse');
    if(b) setBackend('html5');
    return b;
  }), [setBackend])
  
  const TouchTransition = useMemo(() => createTransition('touchstart', (event) => {
    const b = event.type.contains('touch');
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
            delayTouchStart: DELAY_TOUCH_START,
            ignoreContextMenu: false
          },
          transition: TouchTransition
        },
      ],
    }
  }, [MouseTransition, TouchTransition])

  return (
    <DndProvider options={HTML5toTouch}>
      <ScrollComponent>
        {children}
      </ScrollComponent>
      <div className="dr-task-preview-context">
        <Preview generator={({ item, style }) => {
          // @ts-ignore
          if(item.el !== undefined && isNoteElement(item.el)){
            return (
              <ElementPreview
                item={item as TaskElDragItem}
                style={style} 
                backend={backend}
              />
            )
          } else {
            return <></>
          }
        }}/>
      </div>
    </DndProvider>
  )
}



interface ScrollComponentProps {
  children: React.ReactNode;
}
const ScrollComponent = ({ children }: ScrollComponentProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { updatePosition } = useDndScroll(listRef);

  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();

  useEffect(() => {
    const unsubscribe = monitor.subscribeToOffsetChange(() => {
      const offset = monitor.getSourceClientOffset()?.y as number;
      updatePosition({ position: offset, isScrollAllowed: true });
    });
    return unsubscribe;
  }, [monitor, updatePosition]);

  return (
    <div 
      ref={listRef}
      className="dr-scroll-container"
      css={{
        height: "100%",
        overflowY: "auto",
        padding: "0 0.5em",
      }}
    >
      {children}
    </div>
  )
}