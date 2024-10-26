/** @jsxImportSource @emotion/react */
import { Task } from "entities/note";
import React, { CSSProperties, useEffect, useMemo, useRef } from "react";
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
import { TaskPreview } from "./ui/TaskPreview";
import { useDndScroll } from "./hooks/use-dnd-scroll";
import { useDragDropManager } from "react-dnd";
import { DragItem } from "./hooks/use-task-dnd";




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
            delayTouchStart: DRAG_PRESS_DELAY,
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
        <Preview generator={({ item, style }) => (
          <TaskPreview
            item={item as DragItem}
            style={style} 
            backend={backend}
          />
        )}/>
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
      className="dr-note__task-scroll"
      css={{
        height: "100%",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  )
}