import { createContext, useContext } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { DndCase } from './dnd-case';
import { CollisionResolver, OnDragEndContext } from './DndContext';
import { BaseDndItem } from './drag-item';




export type DndStore<T extends BaseDndItem> = {
  droppableId: string | null;
  dndCase: DndCase | null;
  setDndCase: (overId: string, dndCase: DndCase) => void;
  clear: () => void;
  collisionResolver: CollisionResolver<T>;
  onDragEnd: (context: OnDragEndContext<T>) => void;
}

export const createDndStore = <T extends BaseDndItem>({
  collisionResolver,
  onDragEnd,
}: {
  collisionResolver: CollisionResolver<T>;
  onDragEnd: (context: OnDragEndContext<T>) => void;
}): UseBoundStore<StoreApi<DndStore<T>>> => {
  const useDndStore = create<DndStore<T>>(set => ({
    droppableId: null,
    dndCase: null,
    setDndCase: (droppableId: string, dndCase: DndCase) => set({
      droppableId,
      dndCase,
    }),
    clear: () => set({
      droppableId: null,
      dndCase: null,
    }),
    collisionResolver,
    onDragEnd,
  }));
  return useDndStore;
}

export const DndStoreContext = createContext<UseBoundStore<StoreApi<DndStore<BaseDndItem>>> | null>(null);

export const useDndStoreContext = <T extends BaseDndItem>(): UseBoundStore<StoreApi<DndStore<T>>> => {
  const store = useContext(DndStoreContext);
  if (!store) {
    throw new Error('DndStoreContext is not provided');
  }
  return store as UseBoundStore<StoreApi<DndStore<T>>>;
}