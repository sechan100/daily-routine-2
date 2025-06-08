/** @jsxImportSource @emotion/react */
import { useNoteDayStore, useRoutineTreeStore } from "@/entities/note";
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { Notice } from "obsidian";
import { useCallback } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { relocateRoutines } from "../model/relocate-routines";
import { routineCollisionResolver } from "../model/routine-collision-resolver";
import { renderRoutineTree } from "./render-routine-tree";


export const RoutineTreeRoot = () => {
  const day = useNoteDayStore(s => s.day);
  const tree = useRoutineTreeStore(s => s.tree);

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<RoutineDndItem>) => {
    if (day.isPast()) {
      new Notice("Routine Relocation is only allowed for today or future days.");
      return;
    }
    const newTree = await relocateRoutines(tree, {
      active,
      over,
      dndCase,
    });
    useRoutineTreeStore.setState({ tree: newTree });
  }, [day, tree]);

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