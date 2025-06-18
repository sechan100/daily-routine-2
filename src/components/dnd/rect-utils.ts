
export type ClientRect = {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

// top + center + bottom = 1
export type SplitRatio = {
  top: number
  center: number
  bottom: number
}

export type SplitedRect = {
  top: ClientRect;
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
  splitRectHorizontally: (rect: ClientRect, ratio: SplitRatio): SplitedRect => {
    return splitRectToThreeHorizontally(rect, ratio);
  },
  isYInBoundary: (y: number, boundary: ClientRect) => {
    return boundary.top < y && boundary.bottom > y;
  },
}