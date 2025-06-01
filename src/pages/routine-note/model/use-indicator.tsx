import { createWithEqualityFn } from 'zustand/traditional';


type IndicatorStore = {
  nodeId: string | null;
  mode: IndicatorMode | null;
  clearIndicator: () => void;
  setIndicator: (nodeId: string, mode: IndicatorMode) => void;
}
export const useIndicatorStore = createWithEqualityFn<IndicatorStore>(set => ({
  nodeId: null,
  mode: null,
  clearIndicator: () => set({ nodeId: null, mode: null }),
  setIndicator: (nodeId: string, mode: IndicatorMode) => set({ nodeId, mode }),
}));

export const useIndicator = (nodeId: string) => {
  // 특정 노드에 관련된 상태만 구독
  const { mode, nodeId: activeNodeId } = useIndicatorStore(
    (state) => ({
      mode: state.mode,
      nodeId: state.nodeId,
    }),
    // 이 노드와 관련된 상태만 변경될 때 리렌더링
    (a, b) =>
      (a.nodeId !== nodeId && b.nodeId !== nodeId) ||
      (a.nodeId === nodeId && b.nodeId === nodeId && a.mode === b.mode)
  );

  const setIndicator = useIndicatorStore((state) => state.setIndicator);
  const clearIndicator = useIndicatorStore((state) => state.clearIndicator);

  // 이 노드에 대한 indicator가 활성화되었는지 여부
  const isActive = activeNodeId === nodeId;

  return {
    indicator: isActive ? mode : null,
    setIndicator,
    clearIndicator
  };
};