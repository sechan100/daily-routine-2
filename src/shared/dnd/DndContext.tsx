/** @jsxImportSource @emotion/react */
import React, { useMemo } from "react";
import {
  createTransition,
  DndProvider,
  // TouchTransition,
  // MouseTransition,
  MultiBackendOptions,
} from "react-dnd-multi-backend";
import { DragItemPreview } from "./DragItemPreview";
import { DndScrollContainer } from "./ScrollContainer";
import { getBackendFactories } from "./backend";
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


const MouseTransition = createTransition('mousedown', (event) => {
  const b = event.type.contains('mouse');
  return b;
})

const TouchTransition = createTransition('touchstart', (event) => {
  const b = event.type.contains('touch');
  return b;
})

const getMultiBackend = (): MultiBackendOptions => {
  const { html5, touch } = getBackendFactories();
  return {
    backends: [
      {
        id: "html5",
        backend: html5,
        transition: MouseTransition,
      },
      {
        id: "touch",
        backend: touch,
        options: {
          enableMouseEvents: false,
          /**
           * HACK: 아예 없애버리면 mobile에서 file, 또는 directory의 context menu를 열었을 때,
           * 앱에서 스크롤이 안되는 버그가 생긴다. 대충 0.5정도로 해두니 일단 해결됨.
           */
          delayTouchStart: 500,
          ignoreContextMenu: false
        },
        transition: TouchTransition,
      },
    ],
  }
}


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

  const multiBackend = useMemo(() => getMultiBackend(), []);

  return (
    <DndStoreContext.Provider value={dndStore}>
      <DndProvider options={multiBackend}>
        <DndScrollContainer itemTypes={itemTypes}>
          {children}
        </DndScrollContainer>
        <DragItemPreview />
      </DndProvider>
    </DndStoreContext.Provider>
  )
}