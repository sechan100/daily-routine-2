import { ClientRect } from "@dnd-kit/core";
import { Platform } from "obsidian";



export const adjustedMeasureFunction = (node: HTMLElement): ClientRect => {
  const rect = node.getBoundingClientRect();
  if (Platform.isMobile) {
    return {
      top: rect.top - 130,
      left: rect.left - 551,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    }
  } else {
    return rect;
  }
}