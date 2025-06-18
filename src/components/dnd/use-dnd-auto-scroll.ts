import { RefObject, useCallback, useRef } from "react";

export interface IUseScroll {
  position: number;
  isScrollAllowed: boolean;
}

export interface IDndScrollConfig {
  scrollSpeed?: number;
  boundHeight?: number;
  enabled?: boolean;
}

type ScrollDirection = "top" | "bottom" | "stable";

const DEFAULT_CONFIG: Required<IDndScrollConfig> = {
  scrollSpeed: 2.5,
  boundHeight: 30,
  enabled: true
};

function getScrollDirection(
  mouseY: number,
  containerBounds: DOMRect,
  boundHeight: number
): ScrollDirection {
  const { top, bottom } = containerBounds;

  if (mouseY < top + boundHeight) {
    return "top";
  }
  if (mouseY > bottom - boundHeight) {
    return "bottom";
  }
  return "stable";
}

// 기존 API 유지 + 성능 최적화 버전
export const useDndScroll = (
  containerRef: RefObject<HTMLElement>,
  config: IDndScrollConfig = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { scrollSpeed, boundHeight, enabled } = mergedConfig;

  // ref로 상태 관리해서 리렌더링 방지
  const isScrollingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentPositionRef = useRef(0);
  const isAllowedRef = useRef(false);
  const lastDirectionRef = useRef<ScrollDirection>("stable");

  const stopScrolling = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isScrollingRef.current = false;
    lastDirectionRef.current = "stable";
  }, []);

  const startScrolling = useCallback((direction: ScrollDirection) => {
    if (!enabled || !containerRef.current || direction === "stable") {
      stopScrolling();
      return;
    }

    // 같은 방향으로 이미 스크롤 중이면 중복 실행 방지
    if (isScrollingRef.current && lastDirectionRef.current === direction) {
      return;
    }

    // 방향이 바뀌었으면 기존 스크롤 중지
    if (lastDirectionRef.current !== direction) {
      stopScrolling();
    }

    isScrollingRef.current = true;
    lastDirectionRef.current = direction;

    const scroll = () => {
      // 스크롤 허용되지 않거나 컨테이너가 없으면 중지
      if (!isScrollingRef.current || !containerRef.current || !isAllowedRef.current) {
        stopScrolling();
        return;
      }

      const scrollDelta = scrollSpeed * (direction === "top" ? -1 : 1);
      containerRef.current.scrollBy(0, scrollDelta);

      // 다음 프레임에서 계속 실행
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    // 첫 번째 스크롤 실행
    animationFrameRef.current = requestAnimationFrame(scroll);
  }, [enabled, containerRef, scrollSpeed, stopScrolling]);

  // 기존 API와 완전 동일한 updatePosition 함수
  const updatePosition = useCallback((newConfig: Partial<IUseScroll>) => {
    const { position, isScrollAllowed } = newConfig;

    // 위치 업데이트
    if (position !== undefined) {
      currentPositionRef.current = position;
    }

    // 스크롤 허용 상태 업데이트
    if (isScrollAllowed !== undefined) {
      isAllowedRef.current = isScrollAllowed;
    }

    // 스크롤이 허용되지 않으면 즉시 중지
    if (!isAllowedRef.current) {
      stopScrolling();
      return;
    }

    // 컨테이너가 없으면 중지
    if (!containerRef.current) {
      stopScrolling();
      return;
    }

    // 현재 마우스 위치에 따른 스크롤 방향 계산
    const containerBounds = containerRef.current.getBoundingClientRect();
    const direction = getScrollDirection(
      currentPositionRef.current,
      containerBounds,
      boundHeight
    );

    // 방향에 따라 스크롤 시작/중지
    if (direction === "stable") {
      stopScrolling();
    } else {
      startScrolling(direction);
    }
  }, [containerRef, boundHeight, startScrolling, stopScrolling]);

  // cleanup 함수
  const cleanup = useCallback(() => {
    stopScrolling();
  }, [stopScrolling]);

  return { updatePosition, cleanup } as const;
};