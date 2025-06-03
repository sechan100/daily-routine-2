import { useLeaf } from "../view/use-leaf";



type Coordinate = {
  x: number;
  y: number;
}

/**
 * obsidian의 desktop DOM 구조에 맞춰서 dnd-kit의 x, y 좌표를 재조정해준다.
 */
export const adjustDesktopCoordinate = ({ x, y }: Coordinate): Coordinate => {
  const tabHeaderContainer = document.querySelector('.workspace-tab-header-container');
  if (!tabHeaderContainer) {
    return { x, y }
  }
  const { view } = useLeaf.getState();
  const leafEl = view.containerEl;
  const adjustedX = x - (window.innerWidth - leafEl.clientWidth);
  const adjustedY = y - tabHeaderContainer.clientHeight;
  return {
    x: adjustedX,
    y: adjustedY,
  }
}

/**
 * obsidian의 mobile DOM 구조에 맞춰서 dnd-kit의 x, y 좌표를 재조정해준다.
 */
export const adjustMobileCoordinate = ({ x, y }: Coordinate): Coordinate => {
  const { view } = useLeaf.getState();
  const adjustedX = x - (window.innerWidth - view.contentEl.clientWidth);
  const adjustedY = y - (window.innerHeight - view.contentEl.clientHeight);
  return {
    x: adjustedX,
    y: adjustedY,
  }
}