import { DraggableAttributes, useDraggable, useDroppable } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useMemo } from "react";
import { UseIndicator } from "./create-indicator-store";
import { DndData } from "./drag-data";
import { DndCase } from "./resolve-dnd-case";





export type UseDndArgs = {
  id: string;
  dndData: DndData;
  useIndicator: UseIndicator;
  useDragHandle: boolean;
}

export type UseDndReturn = {
  dndRef: (ref: HTMLElement | null) => void;
  isOver: boolean;
  isDragging: boolean;
  dragHandleRef: (ref: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  /**
   * 해당 컴포넌트의 DndCase (해당 컴포넌트가 over인 경우의 DndCase)
   */
  dndCase: DndCase | null;
}

export const useDnd = ({ id, dndData, useIndicator }: UseDndArgs) => {
  const dndCase = useIndicator(id);

  const {
    setNodeRef: droppable,
    isOver,
  } = useDroppable({
    id,
    data: dndData,
  });

  const {
    attributes,
    listeners,
    // transform,
    setActivatorNodeRef: dragHandleRef,
    setNodeRef: draggable,
    isDragging,
  } = useDraggable({
    id,
    data: dndData,
  });

  const dndRef = useMemo(() => (ref: HTMLElement | null) => {
    droppable(ref);
    draggable(ref);
  }, [droppable, draggable]);


  return {
    dndRef,
    isOver,
    isDragging,
    dragHandleRef,
    attributes,
    listeners,
    dndCase,
  }
}