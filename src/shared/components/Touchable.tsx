/** @jsxImportSource @emotion/react */
import { Interpolation, SerializedStyles, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import _ from "lodash";
import { DebouncedFunc } from "lodash";
import { useRef, useCallback, useMemo, forwardRef, memo } from "react";









interface TouchableProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;

  // long press가 인식되는 시간(default: 500ms)
  longPressDelay?: number;

  // pressed 상태가 변경될 때 호출
  onChangePressedState?: (isPressed: boolean) => void;

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
}
export const Touchable = memo(forwardRef<HTMLDivElement, TouchableProps>((props: TouchableProps, ref) => {

  const clickPreventRef = useRef<boolean>(false);
  const performanceRef = useRef<number>(0);
  const startDelay = useMemo(() => props.longPressStartDelay??150, [props.longPressStartDelay]);
  const longPressDelay = useMemo(() => props.longPressDelay??500, [props.longPressDelay]);
  const isMovedRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);

  const longPressDebounce = useRef<DebouncedFunc<(e: React.TouchEvent) => void>>(
    _.debounce((e: React.TouchEvent) => {
      props.onAfterLongPressDelay?.();
    }, longPressDelay)
  );
  const longPressStartDebounce = useRef<DebouncedFunc<(e: React.TouchEvent) => void>>(
    _.debounce((e: React.TouchEvent) => {
      props.onChangePressedState?.(true);
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
    props.onChangePressedState?.(false);
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
    longPressStartCall(e);
  }, [longPressStartCall])

  const touchMove = useCallback((e: React.TouchEvent) => {
    longPressCancel();
    isMovedRef.current = true;
  }, [longPressCancel])
  
  const touchEnd = useCallback((e: React.TouchEvent) => {
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
      onTouchCancel={touchEnd}
      onTouchEnd={touchEnd}
      onClick={onClick}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        if(!isTouchRef.current){
          props.onAfterLongPressDelay?.();
        }
      }}
    >
      {props.children}
    </div>
  )
}))