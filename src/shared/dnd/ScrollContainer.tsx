/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useMemo, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { getAccent } from '../styles/obsidian-accent-color';
import { useDndScroll } from "./use-dnd-auto-scroll";


export const DND_SCROLL_CONTAINER_CLASS_NAME = "dr-dnd-scroll-container";


const gradientCss = css({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "1em",
  background: `linear-gradient(to top, 
    ${getAccent({ a: 0.15 })} 0%,
    transparent 100%
  )`,
  pointerEvents: "none",
  borderRadius: "0.2em",
});

type DndScrollContainerProps = {
  itemTypes: string[];
  children: React.ReactNode;
}
export const DndScrollContainer = ({
  itemTypes,
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
      if (type && itemTypes.includes(type as string)) {
        updatePosition({ position: offset.y, isScrollAllowed: true });
      }
    });
    return unsubscribe;
  }, [updatePosition, monitor, itemTypes]);

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