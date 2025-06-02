/** @jsxImportSource @emotion/react */
import { DndContextProvider, OnDragEndArgs } from "@/shared/dnd/DndContextProvider";
import { useCallback } from "react";
import { useIndicatorStore } from "../model/indicator-store";
import { useRoutineTreeStore } from "../model/routine-tree-store";
import { renderRoutineTree } from "./render-routine-tree";

export const RoutineTreeRoot = () => {
  const day = useRoutineTreeStore(s => s.day);
  const root = useRoutineTreeStore(s => s.root);

  const handleDragEnd = useCallback(({ overId, activeId, dndCase }: OnDragEndArgs) => {
  }, []);

  return (
    <DndContextProvider
      indicatorStore={useIndicatorStore}
      onDragEnd={handleDragEnd}
      useCenterCollisionType={false}
    >
      <div css={{ overflowY: "auto" }}>
        {root.map(nrl => renderRoutineTree(nrl, 0))}
      </div>
    </DndContextProvider>
  )
}