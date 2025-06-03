import { ClientRect } from "@dnd-kit/core";
import { Platform } from "obsidian";
import { adjustDesktopCoordinate, adjustMobileCoordinate } from "./adjust-platform-coordinate";


/**
 * rect의 위치 측정을 조정하는 함수.
 * 모바일 환경에서의 rect 위치를 하드코딩하여 조정해두었다.
 * @param node 
 * @returns 
 */
export const adjusteDraggableMeasure = (node: HTMLElement): ClientRect => {
  const rect = node.getBoundingClientRect();
  const { x, y } = rect;
  return {
    top: y,
    left: x,
    width: rect.width,
    height: rect.height,
    bottom: y + rect.height,
    right: x + rect.width,
  }
}

export const adjusteDragOverlayMeasure = (node: HTMLElement): ClientRect => {
  const rect = node.getBoundingClientRect();
  const { x, y } = Platform.isMobile ? adjustMobileCoordinate(rect) : adjustDesktopCoordinate(rect);
  return {
    top: y,
    left: x,
    width: rect.width,
    height: rect.height,
    bottom: y + rect.height,
    right: x + rect.width,
  }
}