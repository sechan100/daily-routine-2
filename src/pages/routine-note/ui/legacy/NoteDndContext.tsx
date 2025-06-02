/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import {
  DndProvider,
  // TouchTransition,
  // MouseTransition,
  MultiBackendOptions,
  createTransition,
} from "react-dnd-multi-backend";
import { Preview } from "react-dnd-preview";
import { CustomHTML5Backend } from "./CustomHTML5BackendImpl";
import { CustomTouchBackend } from "./CustomTouchBackendImpl copy";
import { DragItem } from './drag-item';
import { ElementPreview } from "./DragItemPreview";
import { useDndScroll } from "./use-dnd-scroll";


export const DELAY_TOUCH_START = 800;


export const NoteDndContext = ({ children }: { children: React.ReactNode }) => {
  const [backend, setBackend] = React.useState<"touch" | "html5">('html5');

  const MouseTransition = useMemo(() => createTransition('mousedown', (event) => {
    const b = event.type.contains('mouse');
    if (b) setBackend('html5');
    return b;
  }), [setBackend])

  const TouchTransition = useMemo(() => createTransition('touchstart', (event) => {
    const b = event.type.contains('touch');
    if (b) setBackend('touch');
    return b;
  }), [setBackend])


  const HTML5toTouch: MultiBackendOptions = useMemo<MultiBackendOptions>(() => ({
    backends: [
      {
        id: "html5",
        backend: CustomHTML5Backend,
        transition: MouseTransition,
      },
      {
        id: "touch",
        backend: CustomTouchBackend,
        options: {
          enableMouseEvents: false,
          /**
           * HACK: 아예 없애버리면 mobile에서 file, 또는 directory의 context menu를 열었을 때,
           * 앱에서 스크롤이 안되는 버그가 생긴다. 대충 0.5정도로 해서 냅두니 괜찮던데
           */
          delayTouchStart: 500,
          ignoreContextMenu: false
        },
        transition: TouchTransition,
      },
    ],
  }), [MouseTransition, TouchTransition])

  return (
    <DndProvider options={HTML5toTouch}>
      <ScrollComponent>
        {children}
      </ScrollComponent>
      <div className="dr-task-preview-context">
        <Preview generator={({ item, style, itemType }) => {
          // @ts-ignore
          if (item.el !== undefined && isNoteElement(item.el) && itemType !== "__NATIVE_TEXT__") {
            return (
              <ElementPreview
                item={item as DragItem}
                style={style}
                backend={backend}
              />
            )
          } else {
            return <></>
          }
        }} />
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