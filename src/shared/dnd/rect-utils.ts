import { ClientRect } from "@dnd-kit/core"




// top + center + bottom = 1
type SplitRatio = {
  top: number
  center: number
  bottom: number
}
type SplitedRect = {
  top: ClientRect
  center: ClientRect
  bottom: ClientRect
}
const splitRectToThreeHorizontally = (rect: ClientRect, ratio: SplitRatio): SplitedRect => {
  const top = {
    width: rect.width,
    height: rect.height * ratio.top,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.top + rect.height * ratio.top
  }
  const center = {
    width: rect.width,
    height: rect.height * ratio.center,
    top: top.bottom,
    left: rect.left,
    right: rect.right,
    bottom: top.bottom + rect.height * ratio.center
  }
  const bottom = {
    width: rect.width,
    height: rect.height * ratio.bottom,
    top: center.bottom,
    left: rect.left,
    right: rect.right,
    bottom: center.bottom + rect.height * ratio.bottom
  }
  return { top, center, bottom }
}


const ratio: SplitRatio = {
  top: 0.35,
  center: 0.3,
  bottom: 0.35
}
export const RectUtils = {
  splitRectToThreeHorizontally: (rect: ClientRect) => splitRectToThreeHorizontally(rect, ratio),
  splitRectToTwoHorizontally: (rect: ClientRect) => {
    return splitRectToThreeHorizontally(rect, {
      top: 0.5,
      center: 0,
      bottom: 0.5
    })
  },
  isYInBoundary: (y: number, boundary: ClientRect) => {
    return boundary.top < y && boundary.bottom > y;
  },
  getRectBaseYLine(rect: ClientRect) {
    return rect.top;
  }
}