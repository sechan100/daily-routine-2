/** @jsxImportSource @emotion/react */
import { RefObject, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { StoreApi } from "zustand";
import { DndCase } from "./dnd-case";
import { DndStore, useDndStoreContext } from "./dnd-store";
import { BaseDndItem } from "./drag-item";
import { DraggableType } from "./draggable-type";
import { investigateCollision } from "./investigate-collision";
import { PreDragState } from "./pre-drag-state";


/**
 * 
 * @param droppableId 
 * @param dndStore 
 * @returns 
 */
const useThisDroppableDndCase = (droppableId: string, dndStore: StoreApi<DndStore<BaseDndItem>>): DndCase | null => {
  /**
   * null인 경우 해당 droppable에 해당하는 dndCase가 없음을 의미한다.
   * 이와는 별개로, 전체 맥락에서의 dndCase는 존재할 수 있다.
   */
  const [thisDroppableDndCase, setCurrentOverDndCase] = useState<DndCase | null>(null);

  useEffect(() => {
    const cleanup = dndStore.subscribe((s) => {
      // 해당 droppable과 연관이 없는 store의 변경은 무시한다.
      if (s.droppableId !== droppableId) {
        setCurrentOverDndCase(null);
        return;
      }
      setCurrentOverDndCase(s.dndCase);
    });
    return () => cleanup();
  }, [thisDroppableDndCase, dndStore, droppableId]);

  return thisDroppableDndCase;
}


type UseDndOptions<T extends BaseDndItem> = {
  dndItem: T;
  draggable: {
    type: DraggableType;
    canDrag?: boolean;
  },
  droppable: {
    accept: DraggableType[];
    rectSplitCount: "two" | "three";
  }
}
export type UseDndResult = {
  isDragging: boolean;
  isOver: boolean;
  preDragState: PreDragState;
  setPreDragState: (state: PreDragState) => void;
  draggable: RefObject<HTMLDivElement>;
  droppable: RefObject<HTMLDivElement>;
  /**
   * 해당 droppable의 DndCase 
   */
  dndCase: DndCase | null;
}
export const useDnd = <D extends BaseDndItem>({
  dndItem,
  draggable,
  draggable: { type, canDrag = true },
  droppable: { accept, rectSplitCount },
}: UseDndOptions<D>): UseDndResult => {
  const dndStore = useDndStoreContext<D>();
  const dndCase = useThisDroppableDndCase(dndItem.id, dndStore);

  const [preDragState, setPreDragState] = useState<PreDragState>("idle");
  const draggableRef = useRef<HTMLDivElement>(null);
  const droppableRef = useRef<HTMLDivElement>(null);

  // DRAG
  const [{ isDragging }, drag, preview] = useDrag({
    type,
    canDrag: canDrag && preDragState === "ready",
    item: dndItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }, [type, dndItem, canDrag, preDragState]);

  // DROP
  const [{ isOver }, drop] = useDrop({
    accept,
    hover(item: D, monitor) {
      dndStore.getState().clear();
      if (item.id === dndItem.id) return null;
      const coord = monitor.getClientOffset() ?? { x: -1, y: -1 };
      const collision = investigateCollision({
        coordinate: coord,
        droppableNode: droppableRef.current as HTMLElement,
        horizontalSplitCount: rectSplitCount
      });
      if (!collision) return null;
      const dndCase = dndStore.getState().collisionResolver({
        active: item,
        over: dndItem,
        collisionType: collision
      });
      if (dndCase !== null) {
        dndStore.getState().setDndCase(String(dndItem.id), dndCase);
      }
    },
    drop: async (item, monitor) => {
      const { droppableId, dndCase } = dndStore.getState();
      dndStore.getState().clear();
      if (!droppableId || !dndCase) return null;
      dndStore.getState().onDragEnd({
        active: item,
        over: dndItem,
        dndCase,
      });
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })

  }, [accept, dndItem, draggable, dndStore, rectSplitCount, dndCase]);

  // dnd configuration
  useEffect(() => {
    if (!draggableRef.current || !droppableRef.current) return;
    drag(draggableRef.current);
    drop(droppableRef.current);
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [drop, drag, preview, draggableRef, droppableRef]);

  return {
    isDragging,
    isOver,
    preDragState,
    draggable: draggableRef,
    droppable: droppableRef,
    setPreDragState,
    dndCase,
  };
}