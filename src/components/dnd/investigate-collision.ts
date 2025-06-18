import { XYCoord } from "react-dnd";
import { RectUtils } from "./rect-utils";

export type DndCollisionContext = {
  coordinate: XYCoord;
  droppableNode: HTMLElement;
  /**
   * 가로로 2등분할지 3등분할지 여부
   * 2등분하면 위 아래 삽입만 가능, 3등분하면 '폴더에 넣기'와 같은 동작을 구현 가능.
   */
  horizontalSplitCount: "two" | "three";
}

export type DndCollisionType = "above" | "below" | "center"


/**
 * over와 active의 충돌 양상을 조사한다.
 * 
 */
export const investigateCollision = ({ coordinate, droppableNode, horizontalSplitCount }: DndCollisionContext): DndCollisionType | null => {
  const droppableRect = droppableNode.getBoundingClientRect();
  const splitedRect = horizontalSplitCount === "three"
    ? RectUtils.splitRectHorizontally(droppableRect, {
      top: 0.35,
      center: 0.3,
      bottom: 0.35,
    })
    :
    RectUtils.splitRectHorizontally(droppableRect, {
      top: 0.5,
      center: 0,
      bottom: 0.5,
    });

  const baseY = coordinate.y;

  if (RectUtils.isYInBoundary(baseY, splitedRect.top)) {
    return "above";
  }
  else if (RectUtils.isYInBoundary(baseY, splitedRect.bottom)) {
    return "below";
  }
  else if (RectUtils.isYInBoundary(baseY, splitedRect.center)) {
    return "center";
  }
  else {
    return null;
  }
}