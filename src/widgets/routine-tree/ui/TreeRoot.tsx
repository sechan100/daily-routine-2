/** @jsxImportSource @emotion/react */
import { useRoutineTree } from '@/features/note';
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { useSettingsStores } from '@/shared/settings';
import { Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { RoutineDndItem } from "../model/dnd-item";
import { filterCompletedRoutines } from '../model/filter-completed-routines';
import { relocateRoutines } from "../model/relocate-routines";
import { routineCollisionResolver } from "../model/routine-collision-resolver";
import { renderRoutineTree } from "./render-routine-tree";


export const TreeRoot = () => {
  const hideCompletedTasksAndRoutines = useSettingsStores(s => s.hideCompletedTasksAndRoutines);
  const { day, ripple, tree } = useRoutineTree();

  const filterdTree = useMemo(() => {
    if (!hideCompletedTasksAndRoutines) {
      return tree;
    } else {
      return filterCompletedRoutines(tree);
    }
  }, [hideCompletedTasksAndRoutines, tree]);

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
      {filterdTree.root.map(nrl => renderRoutineTree(nrl, null, 0))}
    </DndContext>
  )
}