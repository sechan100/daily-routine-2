/** @jsxImportSource @emotion/react */
import React, { useMemo } from "react";
import { DragItemPreview } from "./DragItemPreview";
import { DndScrollContainer } from "./ScrollContainer";
import { DndCase } from "./dnd-case";
import { createDndStore, DndStoreContext } from "./dnd-store";
import { BaseDndItem } from "./drag-item";
import { DndCollisionType } from "./investigate-collision";

export type CollisionContext<T extends BaseDndItem> = {
  active: T;
  over: T;
  collisionType: DndCollisionType;
}

export type OnDragEndContext<T extends BaseDndItem> = {
  active: T;
  over: T;
  dndCase: DndCase;
}

export type CollisionResolver<T extends BaseDndItem> = (context: CollisionContext<T>) => DndCase | null;


export type DndContextProps<T extends BaseDndItem> = {
  itemTypes: string[];
  collisionResolver: CollisionResolver<T>;
  onDragEnd: (context: OnDragEndContext<T>) => void;
  children: React.ReactNode;
}
export const DndContext = <T extends BaseDndItem>({
  itemTypes,
  collisionResolver,
  onDragEnd,
  children,
}: DndContextProps<T>) => {
  const dndStore = useMemo(() => {
    return createDndStore<T>({
      collisionResolver,
      onDragEnd,
    });
  }, [collisionResolver, onDragEnd]);


  return (
    <DndStoreContext.Provider value={dndStore}>
      <DndScrollContainer itemTypes={itemTypes}>
        {children}
      </DndScrollContainer>
      <DragItemPreview />
    </DndStoreContext.Provider>
  )
}