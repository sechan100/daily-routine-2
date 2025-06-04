/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { useCallback } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { routineCollisionResolver } from "../model/routine-collision-resolver";
import { useRoutineTreeStore } from "../model/routine-tree-store";
import { renderRoutineTree } from "./render-routine-tree";


export const RoutineTreeRoot = () => {
  const day = useRoutineTreeStore(s => s.day);
  const root = useRoutineTreeStore(s => s.root);

  const handleDragEnd = useCallback(({ active, over, dndCase }: OnDragEndContext<RoutineDndItem>) => {
  }, []);

  return (
    <DndContext
      collisionResolver={routineCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      <div css={{ overflowY: "auto" }}>
        {root.map(nrl => renderRoutineTree(nrl, null, 0))}
      </div>
    </DndContext>
  )
}