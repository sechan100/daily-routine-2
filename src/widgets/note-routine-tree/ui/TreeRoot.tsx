/** @jsxImportSource @emotion/react */
import { useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { Notice } from "obsidian";
import { useCallback } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { relocateRoutines } from "../model/relocate-routines";
import { routineCollisionResolver } from "../model/routine-collision-resolver";
import { useRippleRoutineTree } from "../model/use-ripple-routines";
import { renderRoutineTree } from "./render-routine-tree";


export const TreeRoot = () => {
  const day = useNoteDayStore(s => s.day);
  const tree = useRoutineTreeStore(s => s.tree);
  const { ripple } = useRippleRoutineTree();

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<RoutineDndItem>) => {
    if (day.isPast()) {
      new Notice("Routine Relocation is not allowed for past routines.");
      return;
    }
    await relocateRoutines(tree, {
      active,
      over,
      dndCase,
    });
    await ripple();
  }, [day, ripple, tree]);

  return (
    <DndContext
      itemTypes={["ROUTINE", "GROUP"]}
      collisionResolver={routineCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      <div css={{ overflowY: "auto" }}>
        {tree.root.map(nrl => renderRoutineTree(nrl, null, 0))}
      </div>
    </DndContext>
  )
}