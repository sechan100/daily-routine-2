/** @jsxImportSource @emotion/react */
import { useRoutineTree } from "@/domain/note/use-routine-tree";
import { DndContext, OnDragEndContext } from "@/shared/dnd/DndContext";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { RoutineDndItem } from "./dnd-item";
import { filterCompletedRoutines } from './filter-completed-routines';
import { relocateRoutines } from "./relocate-routines";
import { renderRoutineTree } from "./render-routine-tree";
import { routineCollisionResolver } from "./routine-collision-resolver";


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