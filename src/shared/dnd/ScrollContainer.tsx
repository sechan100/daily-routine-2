/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { useDndScroll } from "./use-dnd-auto-scroll";


type DndScrollContainerProps = {
  itemTypes: string[];
  children: React.ReactNode;
}
export const DndScrollContainer = ({
  itemTypes,
  children
}: DndScrollContainerProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { updatePosition } = useDndScroll(listRef);

  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();

  useEffect(() => {
    const unsubscribe = monitor.subscribeToOffsetChange(() => {
      const offset = monitor.getSourceClientOffset();
      const type = monitor.getItemType();
      if (!offset) {
        return;
      }
      if (type && itemTypes.includes(type as string)) {
        updatePosition({ position: offset.y, isScrollAllowed: true });
      }
    });
    return unsubscribe;
  }, [updatePosition, monitor, itemTypes]);

  return (
    <div
      ref={listRef}
      css={{
        height: "100%",
        overflowY: "auto",
        paddingBottom: "8px", // 아래 여백
      }}
    >
      {children}
    </div>
  )
}