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
      className="dr-dnd-scroll-container"
      css={{
        height: "100%",
        overflowY: "auto",
        // 처음, 마지막 child는 각각 margin-top, margin-bottom을 적용하여 스크롤이 자연스럽게 되도록 함
        "& > *:first-of-type": {
          marginTop: "6px",
        },
        "& > *:last-of-type": {
          marginBottom: "6px",
        },
      }}
    >
      {children}
    </div>
  )
}