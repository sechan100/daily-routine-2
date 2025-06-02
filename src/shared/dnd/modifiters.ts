import type { Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { Platform } from 'obsidian';
import { isMobile } from '../utils/plugin-service-locator';
import { useLeaf } from '../view/use-leaf';


const sharedXOffset = 100;
const sharedYOffset = 0;

export const desktopModifier: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (isMobile()) return transform;
  const { view } = useLeaf.getState();
  if (!(draggingNodeRect && activatorEvent && overlayNodeRect)) {
    return transform;
  }

  const activatorCoordinates = getEventCoordinates(activatorEvent);
  if (!activatorCoordinates) {
    return transform;
  }
  const { x, y } = transform;
  const leafEl = view.containerEl;
  const adjustedX = x - (window.innerWidth - leafEl.clientWidth);
  const adjustedY = y - (window.innerHeight - leafEl.clientHeight);

  const { width: draggingWidth, height: draggingHeight } = draggingNodeRect
  const { width: overlayWidth, height: overlayHeight } = overlayNodeRect;

  return {
    ...transform,
    x: adjustedX + sharedXOffset,
    y: adjustedY + sharedYOffset,
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

  const activatorCoordinates = getEventCoordinates(activatorEvent);
  if (!activatorCoordinates) {
    return transform;
  }
  const { x, y } = transform;
  const adjustedX = x + (Platform.isTablet ? 0 : 510);
  const adjustedY = y - 25;

  return {
    ...transform,
    x: adjustedX + sharedXOffset,
    y: adjustedY + sharedYOffset,
  }
}