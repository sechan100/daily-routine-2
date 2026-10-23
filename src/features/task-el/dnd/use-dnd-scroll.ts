import { RefObject, useEffect } from "react";
import { useDragDropManager, XYCoord } from "react-dnd";


// 스크롤 영역의 위·아래 가장자리에서 이 거리(px) 안으로 들어오면 자동 스크롤한다.
const EDGE_SIZE = 48;
// 가장자리 끝(또는 그 바깥)에서의 속도(px/s)
const MAX_SPEED = 720;

type ScrollRect = Pick<DOMRect, "top" | "bottom" | "left" | "right">;

/**
 * 포인터 위치에 따른 자동 스크롤 속도(px/s). 음수는 위, 양수는 아래로 스크롤한다.
 * 가장자리 영역에 깊이 들어갈수록 빨라지고, 영역 밖으로 벗어나도 최대 속도를 유지한다.
 */
export const getAutoScrollVelocity = (pointer: XYCoord, rect: ScrollRect, edgeSize = EDGE_SIZE, maxSpeed = MAX_SPEED): number => {
  // 옆 pane으로 끌고 나간 경우에는 스크롤하지 않는다.
  if(pointer.x < rect.left || pointer.x > rect.right) return 0;
  // 스크롤 영역이 작으면 위·아래 가장자리 영역이 겹치지 않도록 줄인다.
  const edge = Math.min(edgeSize, (rect.bottom - rect.top) / 2);
  if(edge <= 0) return 0;

  const intoTop = rect.top + edge - pointer.y;
  if(intoTop > 0) return -maxSpeed * Math.min(intoTop / edge, 1);
  const intoBottom = pointer.y - (rect.bottom - edge);
  if(intoBottom > 0) return maxSpeed * Math.min(intoBottom / edge, 1);
  return 0;
}


/**
 * 드래그 중 포인터가 ref 영역의 위·아래 가장자리에 있으면 그 방향으로 스크롤한다.
 * requestAnimationFrame으로 돌리며, 포인터가 가장자리를 벗어나거나 드래그가 끝나면(drop·cancel) 멈춘다.
 */
export const useDndScroll = (ref: RefObject<HTMLElement | null>) => {
  const manager = useDragDropManager();

  useEffect(() => {
    const monitor = manager.getMonitor();
    let target: HTMLElement | null = null;
    let frame: number | null = null;
    let lastTime: number | null = null;
    // scrollTop은 정수로 반올림되므로, 1px 미만의 이동량은 모아뒀다가 반영한다.
    let carry = 0;

    const velocityOf = (el: HTMLElement | null): number => {
      const pointer = monitor.isDragging() ? monitor.getClientOffset() : null;
      if(!el || !pointer) return 0;
      return getAutoScrollVelocity(pointer, el.getBoundingClientRect());
    }

    const stop = () => {
      if(frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
      carry = 0;
    }

    const step = (time: number) => {
      const velocity = velocityOf(target);
      if(!target || velocity === 0 || !canScrollToward(target, velocity)){
        stop();
        return;
      }
      // 프레임 간격에 비례해 움직여서, 주사율과 관계없이 같은 속도로 스크롤한다.
      const dt = lastTime === null ? 16 : Math.min(time - lastTime, 32);
      lastTime = time;
      carry += velocity * dt / 1000;
      const delta = Math.trunc(carry);
      if(delta !== 0){
        target.scrollTop += delta;
        carry -= delta;
      }
      frame = window.requestAnimationFrame(step);
    }

    const onDragChange = () => {
      if(!monitor.isDragging()){
        stop();
        target = null;
        return;
      }
      if(frame !== null) return;
      // 스크롤 대상은 드래그마다 한 번만 찾는다. (offset은 포인터가 움직일 때마다 바뀐다)
      if(!target) target = findScrollable(ref.current);
      const velocity = velocityOf(target);
      if(target && velocity !== 0 && canScrollToward(target, velocity)){
        frame = window.requestAnimationFrame(step);
      }
    }

    const unsubscribeOffset = monitor.subscribeToOffsetChange(onDragChange);
    const unsubscribeState = monitor.subscribeToStateChange(onDragChange);
    return () => {
      unsubscribeOffset();
      unsubscribeState();
      stop();
    }
  }, [manager, ref]);
}


// 끝까지 스크롤된 방향으로는 frame을 돌리지 않는다.
const canScrollToward = (el: HTMLElement, velocity: number): boolean => {
  if(velocity < 0) return el.scrollTop > 0;
  return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}

// el 자신 또는 가장 가까운, 실제로 스크롤되는 조상을 찾는다.
const findScrollable = (el: HTMLElement | null): HTMLElement | null => {
  let node = el;
  while(node){
    const { overflowY } = getComputedStyle(node);
    if((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight){
      return node;
    }
    node = node.parentElement;
  }
  return el;
}
