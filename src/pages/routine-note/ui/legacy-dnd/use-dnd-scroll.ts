import { RefObject, useEffect, useRef, useState } from "react";

export interface IUseScroll {
  position: number;
  isScrollAllowed: boolean;
}

const BOUND_HEIGHT = 70;

function getScrollDirection({
  position,
  upperBounds = Infinity,
  lowerBounds = -Infinity
}: {
  position: number | undefined;
  upperBounds: number | undefined;
  lowerBounds: number | undefined;
}): "top" | "bottom" | "stable" {
  if (position === undefined) {
    return "stable";
  }
  if (position > lowerBounds - BOUND_HEIGHT) {
    return "bottom";
  }
  if (position < upperBounds + BOUND_HEIGHT) {
    return "top";
  }
  return "stable";
}

export const useDndScroll = (ref: RefObject<HTMLElement | null>) => {
  const [config, setConfig] = useState<Partial<IUseScroll>>({
    position: 0,
    isScrollAllowed: false
  });

  const scrollTimer = useRef<null | NodeJS.Timeout>(null);

  const scrollSpeed = 3; // 스크롤 이동량 조정
  const scrollInterval = 1; // 50ms 간격으로 스크롤 업데이트
  const { position, isScrollAllowed } = config;

  const bounds = ref.current?.getBoundingClientRect();
  const direction = getScrollDirection({
    position,
    upperBounds: bounds?.top,
    lowerBounds: bounds?.bottom
  });

  useEffect(() => {
    if (direction !== "stable" && isScrollAllowed) {
      scrollTimer.current = setInterval(() => {
        ref.current?.scrollBy(0, scrollSpeed * (direction === "top" ? -1 : 1));
      }, scrollInterval);
    }
    return () => {
      if (scrollTimer.current) {
        clearInterval(scrollTimer.current);
      }
    };
  }, [isScrollAllowed, direction, ref, scrollSpeed]);

  return { updatePosition: setConfig } as const;
};
