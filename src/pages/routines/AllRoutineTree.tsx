import { DndContext, OnDragEndContext } from "@/components/dnd/DndContext";
import { useRipple } from "@/service/use-ripple";
import { useAllRoutineTreeQuery } from "@/stores/server/use-all-routine-tree-query";
import { useCallback } from "react";
import { RoutineDndItem } from "./model/dnd-item";
import { relocateRoutines } from "./model/relocate-routines";
import { routineCollisionResolver } from "./model/routine-collision-resolver";
import { renderRoutineNodes } from "./render-routine-nodes";






type Props = {
  children?: React.ReactNode;
}
export const AllRoutineTree = ({
  children
}: Props) => {
  const { allRoutineTree } = useAllRoutineTreeQuery();
  const { ripple } = useRipple();

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<RoutineDndItem>) => {
    await relocateRoutines(allRoutineTree, {
      active,
      over,
      dndCase,
    });
    await ripple();
  }, [allRoutineTree, ripple]);

  return (
    <DndContext
      draggableTypes={["ROUTINE", "GROUP"]}
      collisionResolver={routineCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      {allRoutineTree.root.map(nrl => renderRoutineNodes(nrl, null, 0))}
    </DndContext>
  )
}