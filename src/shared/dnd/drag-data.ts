import { Active, Over } from "@dnd-kit/core";


export type DndData = {
  isFolder: boolean;
  isOpen: boolean;
}


export const getDndData = <T>(activeOrOver: Active | Over): DndData => {
  const dataRef = activeOrOver.data;
  if (!dataRef.current) {
    throw new Error("[Dnd Error]: Active 또는 Over에 data가 없습니다.");
  }
  return dataRef.current as DndData;
}