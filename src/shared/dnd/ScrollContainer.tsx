/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { useDndScroll } from "./use-dnd-auto-scroll";


type DndScrollContainerProps = {
  children: React.ReactNode;
}
export const DndScrollContainer = ({ children }: DndScrollContainerProps) => {
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
      className="dr-dnd-scroll-container"
      css={{
        height: "100%",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  )
}