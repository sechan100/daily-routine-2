/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { useCallback } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { relocateRoutines } from "../model/relocate-routines";
import { routineCollisionResolver } from "../model/routine-collision-resolver";
import { useRoutineTreeStore } from "../model/routine-tree-store";
import { renderRoutineTree } from "./render-routine-tree";


export const RoutineTreeRoot = () => {
  const tree = useRoutineTreeStore(s => s.tree);

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<RoutineDndItem>) => {
    const newTree = await relocateRoutines(tree, {
      active,
      over,
      dndCase,
    });
    useRoutineTreeStore.getState().actions.setRoutineTree(newTree);
  }, [tree]);

  return (
    <DndContext
      collisionResolver={routineCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      <div css={{ overflowY: "auto" }}>
        {tree.root.map(nrl => renderRoutineTree(nrl, null, 0))}
      </div>
    </DndContext>
  )
}