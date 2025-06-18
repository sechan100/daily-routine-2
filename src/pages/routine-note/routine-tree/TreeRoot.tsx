/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/components/dnd/DndContext";
import { useRoutineTree } from "@/service/use-routine-tree";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { Notice } from "obsidian";
import { useCallback, useMemo } from "react";
import { RoutineDndItem } from "../../routines/model/dnd-item";
import { relocateRoutines } from "../../routines/model/relocate-routines";
import { routineCollisionResolver } from "../../routines/model/routine-collision-resolver";
import { filterCompletedRoutines } from './filter-completed-routines';
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
      draggableTypes={["ROUTINE", "GROUP"]}
      collisionResolver={routineCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      {filterdTree.root.map(nrl => renderRoutineTree(nrl, null, 0))}
    </DndContext>
  )
}