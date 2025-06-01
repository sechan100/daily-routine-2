import { useEffect, useState } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { DndCase } from './resolve-dnd-case';


export type IndicatorStore = {
  overId: string | null;
  dndCase: DndCase | null;
  setDndCase: (overId: string, dndCase: DndCase) => void;
  clear: () => void;
}

export type UseIndicator = (overId: string) => DndCase | null;

export const createIndicatorStore = (): {
  useIndicatorStore: UseBoundStore<StoreApi<IndicatorStore>>;
  useIndicator: UseIndicator;
} => {
  const useIndicatorStore = create<IndicatorStore>(set => ({
    overId: null,
    dndCase: null,
    setDndCase: (overId: string, dndCase: DndCase) => set({
      overId,
      dndCase,
    }),
    clear: () => set({
      overId: null,
      dndCase: null,
    }),
  }));

  const useIndicator: UseIndicator = (overId: string) => {
    // null인 경우 해당 over에 해당 indicator가 없음을 의미한다.
    // 전체 dnd 상태에서의 dndCase와는 무관하다.
    const [currentOverDndCase, setCurrentOverDndCase] = useState<DndCase | null>(null);

    useEffect(() => {
      const cleanup = useIndicatorStore.subscribe((s) => {
        // 해당 over 객체와 연관이 없는 indicator 변경은 무시한다.
        if (s.overId !== overId) {
          if (currentOverDndCase !== null) {
            setCurrentOverDndCase(null);
          }
          return;
        }

        setCurrentOverDndCase(s.dndCase);
      });
      return () => cleanup();
    }, [currentOverDndCase, overId]);

    return currentOverDndCase;
  }

  return {
    useIndicatorStore,
    useIndicator,
  }
}