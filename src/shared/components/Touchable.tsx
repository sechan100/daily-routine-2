/** @jsxImportSource @emotion/react */
import { debounce, DebouncedFunc } from "es-toolkit/compat";
import { useRef, useCallback, useMemo, forwardRef, memo } from "react";









interface TouchableProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;

  // long press가 인식되는 시간(default: 500ms)
  longPressDelay?: number;

  // pressed 상태가 변경될 때 호출
  onPressChange?: (isPressed: boolean) => void;

  // click인지, long press인지 판단하기 위한 지연시간
  longPressStartDelay?: number;

  // long press가 시작될 때 호출
  onLongPressStart?: (e: React.TouchEvent) => void;

  // long press가 인식된 후, 지연시간이 지난 후 호출
  onAfterLongPressDelay?: () => void;

  // long press가 인식된 후, 손가락을 뗐을 때 호출
  onLongPressEnd?: (e: React.TouchEvent) => void;

  // click
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;

  // 마우스 우클릭(contextmenu). 터치 long press가 만든 contextmenu에는 호출되지 않는다.
  onContextMenu?: (e: React.MouseEvent) => void;
}

// 터치 직후(long press 중 contextmenu가 touchmove 뒤에 발생하는 경우 포함) 들어온 contextmenu는 터치로 취급
const TOUCH_CONTEXT_MENU_WINDOW = 1000;
export const Touchable = memo(forwardRef<HTMLDivElement, TouchableProps>((props: TouchableProps, ref) => {

  const clickPreventRef = useRef<boolean>(false);
  const performanceRef = useRef<number>(0);
  const startDelay = useMemo(() => props.longPressStartDelay??150, [props.longPressStartDelay]);
  const longPressDelay = useMemo(() => props.longPressDelay??500, [props.longPressDelay]);
  const isMovedRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);
  const lastTouchAtRef = useRef<number>(Number.NEGATIVE_INFINITY);

  const longPressDebounce = useRef<DebouncedFunc<(e: React.TouchEvent) => void>>(
    debounce((_e: React.TouchEvent) => {
      props.onAfterLongPressDelay?.();
    }, longPressDelay)
  );
  const longPressStartDebounce = useRef<DebouncedFunc<(e: React.TouchEvent) => void>>(
    debounce((e: React.TouchEvent) => {
      props.onPressChange?.(true);
      props.onLongPressStart?.(e);
    }, startDelay)
  );

  const longPressStartCall = useCallback((e: React.TouchEvent) => {
    isTouchRef.current = true;
    longPressDebounce.current(e);
    longPressStartDebounce.current(e);
  }, []);
  
  const longPressCancel = useCallback(() => {
    isTouchRef.current = false;
    longPressDebounce.current.cancel();
    longPressStartDebounce.current.cancel();
    props.onPressChange?.(false);
  }, [props]);
  
  const onClick = useCallback((e: React.MouseEvent) => {
    if(clickPreventRef.current){
      clickPreventRef.current = false;
      return;
    }
    props.onClick?.(e);
  }, [props])
  
  
  const touchStart = useCallback((e: React.TouchEvent) => {
    performanceRef.current = performance.now();
    lastTouchAtRef.current = performanceRef.current;
    longPressStartCall(e);
  }, [longPressStartCall])

  const touchMove = useCallback((_e: React.TouchEvent) => {
    lastTouchAtRef.current = performance.now();
    longPressCancel();
    isMovedRef.current = true;
  }, [longPressCancel])

  // OS/edge-swipe 등으로 터치가 중단된 경우: click으로 취급하면 안 되므로 상태만 초기화
  const touchCancel = useCallback((_e: React.TouchEvent) => {
    lastTouchAtRef.current = performance.now();
    longPressCancel();
    performanceRef.current = 0;
    isMovedRef.current = false;
  }, [longPressCancel])
  
  const touchEnd = useCallback((e: React.TouchEvent) => {
    lastTouchAtRef.current = performance.now();
    longPressCancel();
    const duration = performance.now() - performanceRef.current + 50; // 50ms는 딜레이
    performanceRef.current = 0;
    if(duration < longPressDelay && !isMovedRef.current){
      props.onClick?.(e);
      clickPreventRef.current = true;
    }
    else {
      props.onLongPressEnd?.(e);
    }
    isMovedRef.current = false;
  }, [longPressCancel, longPressDelay, props])
  
  return (
    <div
      ref={ref}
      style={props.style}
      className={props.className}
      onTouchStart={touchStart}
      onTouchMove={touchMove}
      onTouchCancel={touchCancel}
      onTouchEnd={touchEnd}
      onClick={onClick}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        // 터치 long press는 debounce(onAfterLongPressDelay)가 처리하므로, 데스크톱 우클릭만 전달한다.
        const fromTouch = isTouchRef.current || performance.now() - lastTouchAtRef.current < TOUCH_CONTEXT_MENU_WINDOW;
        if(!fromTouch){
          props.onContextMenu?.(e);
        }
      }}
    >
      {props.children}
    </div>
  )
}))