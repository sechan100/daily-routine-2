import type { Modifier } from '@dnd-kit/core';
import { Platform } from 'obsidian';
import { isMobile } from '../utils/plugin-service-locator';
import { adjustDesktopCoordinate, adjustMobileCoordinate } from './adjust-platform-coordinate';


export const desktopModifier: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (isMobile()) return transform;
  if (!(draggingNodeRect && activatorEvent && overlayNodeRect)) {
    return transform;
  }
  const { x: adjustedX, y: adjustedY } = adjustDesktopCoordinate(transform);
  return {
    ...transform,
    x: adjustedX,
    y: adjustedY,
  }
}


export const mobileModifier: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!Platform.isMobile) return transform;
  if (!(draggingNodeRect && activatorEvent && overlayNodeRect)) {
    return transform;
  }
  const { x: adjustedX, y: adjustedY } = adjustMobileCoordinate(transform);
  return {
    ...transform,
    x: adjustedX,
    y: adjustedY,
  }
}