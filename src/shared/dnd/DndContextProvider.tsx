import { closestCenter, DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import { useCallback, useRef } from "react";
import { StoreApi } from "zustand";
import { OverlayProvider } from "./OverlayProvider";
import { adjusteDraggableMeasure, adjusteDragOverlayMeasure } from "./adjusted-measure-function";
import { IndicatorStore } from "./create-indicator-store";
import { DndRectCollisionInvestigator } from "./dnd-rect-collision";
import { getDndData } from "./drag-data";
import { DndCase, resolveDndCase } from "./resolve-dnd-case";
import { useDndKitSensors } from "./use-dnd-kit-sensors";


export type OnDragEndArgs = {
  overId: string;
  activeId: string;
  dndCase: DndCase;
}
type DndContextProviderProps = {
  indicatorStore: StoreApi<IndicatorStore>;
  children: React.ReactNode;
  onDragEnd: (args: OnDragEndArgs) => void;
  /**
   * rect의 중앙부분 충돌을 사용할지 여부.
   * 사용하는 경우, over rect를 3등분하여 중앙 부분에 위치한 경우를 "center"로 판단한다.
   * 
   * 사용하지 않는다면 2등분하여 "above"와 "below"로만 판단한다.
   */
  useCenterCollisionType: boolean;
}
export const DndContextProvider = ({ indicatorStore, children, onDragEnd, useCenterCollisionType }: DndContextProviderProps) => {
  const sensors = useDndKitSensors();
  const collisionInvestigator = useRef(new DndRectCollisionInvestigator(useCenterCollisionType))

  const handleDragMove = useCallback(({ over, active }: DragMoveEvent) => {
    if (!over) return null;
    const collisionType = collisionInvestigator.current.investigate({ active, over });
    if (!collisionType) return null;

    const dndData = getDndData(over)
    const dndCase = resolveDndCase({
      collisionType,
      isOverFolder: dndData.isFolder,
      isOverOpen: dndData.isOpen,
      over,
      active
    });
    if (dndCase !== null) {
      indicatorStore.getState().setDndCase(String(over.id), dndCase);
    } else {
      indicatorStore.getState().clear();
    }
  }, [indicatorStore]);

  const handleDragEnd = useCallback(({ over, active }: DragEndEvent) => {
    if (!over) return null;
    const { overId, dndCase } = indicatorStore.getState();
    if (!overId || !dndCase) return null;
    onDragEnd({
      overId: String(over.id),
      activeId: String(active.id),
      dndCase,
    });
  }, [indicatorStore, onDragEnd]);

  return (
    <DndContext
      sensors={sensors}
      measuring={{
        draggable: {
          measure: adjusteDraggableMeasure
        },
        dragOverlay: {
          measure: adjusteDragOverlayMeasure
        }
      }}
      collisionDetection={closestCenter}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      autoScroll={true}
    >
      {children}
      <OverlayProvider />
    </DndContext >
  )
}