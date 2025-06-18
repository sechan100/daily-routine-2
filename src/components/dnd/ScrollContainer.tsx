/** @jsxImportSource @emotion/react */
import { useEffect, useMemo, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { DraggableType, isDraggableType } from "./draggable-type";
import { useDndScroll } from "./use-dnd-auto-scroll";


export const DND_SCROLL_CONTAINER_CLASS_NAME = "dr-dnd-scroll-container";


type DndScrollContainerProps = {
  draggableTypes: DraggableType[];
  children: React.ReactNode;
}
export const DndScrollContainer = ({
  draggableTypes,
  children
}: DndScrollContainerProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { updatePosition } = useDndScroll(scrollContainerRef);

  const contentHeight = useMemo(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return 0;
    }
    return container.scrollHeight;
  }, []);

  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();

  useEffect(() => {
    const unsubscribe = monitor.subscribeToOffsetChange(() => {
      const offset = monitor.getSourceClientOffset();
      const type = monitor.getItemType();
      if (!offset) {
        return;
      }
      if (type && isDraggableType(type)) {
        updatePosition({ position: offset.y, isScrollAllowed: true });
      }
    });
    return unsubscribe;
  }, [updatePosition, monitor, draggableTypes]);

  return (
    <div
      className={DND_SCROLL_CONTAINER_CLASS_NAME}
      ref={scrollContainerRef}
      css={{
        height: "100%",
        overflowY: "auto",
        paddingBottom: contentHeight !== 0 ? "8px" : 0, // contentHeight가 있을 때는 아래 여백을 준다.
      }}
    >
      {children}
    </div>
  )
}