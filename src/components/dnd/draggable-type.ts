
export const DRAGGABLE_TYPES = ["ROUTINE", "GROUP", "TASK"] as const;

export type DraggableType = (typeof DRAGGABLE_TYPES)[number];

export const isDraggableType = (type: unknown): type is DraggableType => {
  return DRAGGABLE_TYPES.includes(type as DraggableType);
}