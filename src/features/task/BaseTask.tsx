/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Task } from "entities/routine-note";
import _ from "lodash";
import { DebouncedFunc } from "lodash";
import { forwardRef, useCallback, useMemo, useRef } from "react"
import { dr } from "shared/daily-routine-bem";




/**
 * NOTE: onContextMenu를 사용하지 않는 이유에 대해서
 * https://forum.obsidian.md/t/hold-tap-on-the-note-or-folder-opens-bottom-menu-twice/58572
 */
export interface BaseTaskProps {
  task: Task;
  isReady?: boolean; // drag-ready
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  onClick?: () => void;
  longPressDelay?: number;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  onOptionMenu?: (task: Task) => void;
}
export const BaseTask = forwardRef<HTMLDivElement, BaseTaskProps>((props, ref) => {

  const delay = useMemo(() => props.longPressDelay??500, [props.longPressDelay]);

  const clickPreventRef = useRef<boolean>(false);

  const onInteralClick = useCallback(() => {
    if(clickPreventRef.current){
      clickPreventRef.current = false;
      return;
    }
    props.onClick?.();
  }, [props])

  const onOptionMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    props.onOptionMenu?.(props.task);
  }, [props])

  const touchDebounce = useRef<DebouncedFunc<() => void>>(
    _.debounce(() => {
      props.onLongPressStart?.();
    }, delay)
  );
  
  const performanceRef = useRef<number>(0);
  
  const touchStart = useCallback(() => {
    touchDebounce.current()
    performanceRef.current = performance.now();
  }, [])
  
  const touchEnd = useCallback((e: React.TouchEvent) => {
    touchDebounce.current.cancel();
    const duration = performance.now() - performanceRef.current;
    performanceRef.current = 0;
    if(duration < delay){
      props.onClick?.();
      clickPreventRef.current = true;
    }
    else {
      props.onLongPressEnd?.();
    }
  }, [delay, props])

  
  const bem = useMemo(() => dr("task"), []);
  return (
    <div
      ref={ref}
      className={bem("", {
        "checked": props.task.checked,
        "ready": props.isReady??false,
        "dragging": props.isDragging??false
      }, props.className)}
      style={props.style}
      onClick={onInteralClick}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onTouchCancel={touchEnd}
      css={css`
        display: block;
        font-size: 16px;
        width: 100%;
        height: 2.3em;
        padding: 0 0.5em;
        margin: 0 0;
        cursor: pointer;
        &.dr-task--ready, &.dr-task--dragging {
          position: relative;
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 5px; 
            background-color: hsla(var(--color-accent-1-hsl), 0.5)
          }
        }
      `}
    >
      <div 
        className={bem("container")}
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        `}
      >
        {/* MAIN */}
        <div 
          className={bem("main")}
          css={css`
            display: flex;
            align-items: center;
            line-height: 1;
          `}
        >
          <span
            className={bem("cbx")}
            css={css`
              position: relative;
              top: calc(1/32 * 1em);
              display: inline-block;
              width: calc(14/16 * 1em);
              height: calc(14/16 * 1em);
              margin-right: calc(0.5em);
              border: calc(1/16 * 1em) solid #c8ccd4;
              border-radius: 3px;
              cursor: pointer;
              // 체크표시 V
              &:before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                margin: calc(-5/8 * 1em) 0 0 calc(-5/8 * 1em);
                width: calc(5/4 * 1em);
                height: calc(5/4 * 1em);
                border-radius: 100%;
                background: hsla(var(--color-accent-1-hsl), 1.0);
                transform: scale(0);
              }
                
              // 체크 이펙트
              &:after {
                content: '';
                position: absolute;
                top: calc(5/16 * 1em);
                left: calc(5/16 * 1em);
                width: calc(1/8 * 1em);
                height: calc(1/8 * 1em);
                border-radius: 2px; 
                box-shadow: 0 calc(9/8 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * 1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), 0 calc(9/8 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * -1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0);
                transform: scale(0);
              }
                
              // 체크된 경우
              .dr-task--checked & {
                border-color: transparent;
                &:before {
                  transform: scale(1);
                  opacity: 0;
                  transition: all 0.3s ease;
                }
                &:after {
                  transform: scale(1);
                  opacity: 0;
                  transition: all 0.6s ease;
                }
              }
            `}
          >
              <svg 
                viewBox="0 0 14 12"
                css={css`
                  position: relative;
                  width: calc(7/8 * 1em);
                  height: calc(3/4 * 1em);
                  top: calc(-1/16 * 1em);
                  transform: scale(0);
                  fill: none;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  
                  .dr-task--checked & {
                    transform: scale(1);
                    transition: all 0.4s ease;
                    transition-delay: 0.1s;
                  }
                `}
              >
                <polyline 
                  points="1 7.6 5 11 13 1"
                  css={css`
                    strokeWidth: 2;
                    stroke: var(--color-accent-1);
                  `}
                />
              </svg>
            </span>
          <span 
            className={bem("name")}
            css={css`
              position: relative;
              cursor: pointer;
              transition: color 0.3s ease;
              &:after {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                width: 0;
                height: 1px;
                background: #9098a9;
              }
              .dr-task--checked & {
                color: #9098a9;
                &:after {
                  width: 100%;
                  transition: all 0.4s ease;
                }
              }
            `}
          >{props.task.name}</span>
        </div>
        {/* 옵션 */}
        <div
          className={bem("option")}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onOptionMenuClick(e);
          }}
          css={css`
            width: 1.2em;
            cursor: pointer;
            position: relative;
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            css={css`
              position: absolute;
              transform: translateY(-50%);
              width: 1.2em;
            `}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </div>
      </div>
    </div>
  )
})