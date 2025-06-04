import { DndCase } from '@/shared/dnd/dnd-case';
import { CollisionContext } from '@/shared/dnd/DndContext';
import { RoutineDndItem } from './dnd-item';


export const routineCollisionResolver = ({ collisionType, active, over }: CollisionContext<RoutineDndItem>): DndCase | null => {
  if (over.id === active.id) return null;

  // over가 group
  if (over.nrlType === "routine-group") {
    // group 열려있음
    if (over.routineGroup.isOpen) {
      switch (collisionType) {
        case "above":
          return "insert-before";
        case "below":
          return "insert-into-first";
        case "center":
          return null;
      }
    }
    // group 닫혀있음
    else {
      switch (collisionType) {
        case "above":
          return "insert-before";
        case "below":
          return "insert-after";
        case "center":
          if (active.nrlType === "routine") {
            return "insert-into-last";
          } else {
            return null;
          }
      }
    }
  }
  // over가 routine
  else {
    switch (collisionType) {
      case "above":
        return "insert-before";
      case "below":
        return "insert-after";
      case "center":
        return null;
    }
  }
}