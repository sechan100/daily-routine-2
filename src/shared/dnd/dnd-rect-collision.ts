import { Active, Over } from "@dnd-kit/core";
import { RectUtils } from "./rect-utils";

export type DndCollisionContext = {
  active: Active;
  over: Over;
}

export type DndCollisionType = "above" | "below" | "center"

export class DndRectCollisionInvestigator {
  /**
   * 중앙에 over된 collisionType 사용할지 여부.
   * 사용하지 않는 경우, over된 노드의 영역을 3등분 하지 않고 2등분하여 계산한다.
   */
  private useCenterCollisionType: boolean;


  constructor(useCenterCollisionType: boolean) {
    this.useCenterCollisionType = useCenterCollisionType;
  }

  public investigate({ active, over }: DndCollisionContext): DndCollisionType | null {
    if (active.id === over.id) return null;
    const activeRect = active.rect.current.translated;
    if (!activeRect) return null;

    const splitedRect = this.useCenterCollisionType ? RectUtils.splitRectToThreeHorizontally(over.rect) : RectUtils.splitRectToTwoHorizontally(over.rect);

    // console.log(splitedRect.bottom.top, activeRect.top, splitedRect.bottom.bottom);
    const baseY = activeRect.top + activeRect.height / 2;

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
}