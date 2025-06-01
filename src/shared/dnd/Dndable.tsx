/**@jsxImportSource @emotion/react */

import { getAccent } from "@/shared/components/obsidian-accent-color";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { memo } from "react";
import { Indicator } from "./Indicator";
import { DndCase } from "./resolve-dnd-case";



type Props = {
  dndRef: (ref: HTMLElement | null) => void;
  children: React.ReactNode;
  isDragging: boolean;
  isOver: boolean;
  depth: number;
  dndCase: DndCase | null;
  dragHandle?: {
    ref: (ref: HTMLElement | null) => void;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  }
}
export const BaseDndable = memo(function Dndable({
  dndRef,
  children,
  isDragging,
  isOver,
  depth,
  dndCase,
  dragHandle,
}: Props) {

  return (
    <div
      ref={dndRef}
      {...(dragHandle ? dragHandle.attributes : {})}
      {...(dragHandle ? dragHandle.listeners : {})}
      css={{
        position: "relative",
        touchAction: "none",
        backgroundColor: isDragging ? getAccent() : undefined,
      }}
    >
      {children}
      {isOver && dndCase && <Indicator dndCase={dndCase} depth={depth} />}
    </div >
  )
});