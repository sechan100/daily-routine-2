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
  longPressDelay?: number;
  onLongPressStart?: (e: React.TouchEvent) => void;
  onLongPressEnd?: (e: React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
}
export const Touchable = memo(forwardRef<HTMLDivElement, TouchableProps>((props: TouchableProps, ref) => {

  const clickPreventRef = useRef<boolean>(false);
  const performanceRef = useRef<number>(0);
  const delay = useMemo(() => props.longPressDelay??500, [props.longPressDelay]);

  const touchDebounce = useRef<DebouncedFunc<(e: React.TouchEvent) => void>>(
    _.debounce((e: React.TouchEvent) => {
      props.onLongPressStart?.(e);
    }, delay)
  );

  const onClick = useCallback((e: React.MouseEvent) => {
    if(clickPreventRef.current){
      clickPreventRef.current = false;
      return;
    }
    props.onClick?.(e);
  }, [props])

  
  const touchStart = useCallback((e: React.TouchEvent) => {
    touchDebounce.current(e)
    performanceRef.current = performance.now();
  }, [])

  const touchMove = useCallback((e: React.TouchEvent) => {
    touchDebounce.current.cancel();
  }, [])
  
  const touchEnd = useCallback((e: React.TouchEvent) => {
    touchDebounce.current.cancel();
    const duration = performance.now() - performanceRef.current + 50; // 50ms는 딜레이
    performanceRef.current = 0;
    if(duration < delay){
      props.onClick?.(e);
      clickPreventRef.current = true;
    }
    else {
      props.onLongPressEnd?.(e);
    }
  }, [delay, props])
  
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
    >
      {props.children}
    </div>
  )
}))