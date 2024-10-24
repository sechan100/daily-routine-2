/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Task } from "entities/note";
import _ from "lodash";
import { forwardRef, useCallback, useMemo } from "react"
import { Touchable } from "shared/components/Touchable";
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

  const onOptionMenuClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    props.onOptionMenu?.(props.task);
  }, [props])

  
  const bem = useMemo(() => dr("task"), []);
  return (
    <Touchable
      ref={ref}
      className={bem("", {
        "checked": props.task.checked,
        "ready": props.isReady??false,
        "dragging": props.isDragging??false
      }, props.className)}
      style={props.style}
      longPressDelay={props.longPressDelay}
      onClick={props.onClick}
      onLongPressStart={props.onLongPressStart}
      onLongPressEnd={props.onLongPressEnd}
      css={{
        display: "block",
        fontSize: "16px",
        width: "100%",
        height: "2.5em",
        padding: "0 0 0 0.5em",
        margin: "0 0",
        cursor: "pointer",
        "&.dr-task--ready, &.dr-task--dragging": {
          position: "relative",
          "&::after": {
            content: "''",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            borderRadius: "5px",
            backgroundColor: "hsla(var(--color-accent-1-hsl), 0.5)",
          }
        }
      }}
    >
      <div 
        className={bem("container")}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* MAIN */}
        <div 
          className={bem("main")}
          css={{
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          <span
            className={bem("cbx")}
            css={{
              position: "relative",
              top: "calc(1/32 * 1em)",
              display: "inline-block",
              width: "calc(14/16 * 1em)",
              height: "calc(14/16 * 1em)",
              marginRight: "calc(0.5em)",
              border: "calc(1/16 * 1em) solid #c8ccd4",
              borderRadius: "3px",
              cursor: "pointer",
              // 체크표시 V
              "&:before": {
                content: "''",
                position: "absolute",
                top: "50%",
                left: "50%",
                margin: "calc(-5/8 * 1em) 0 0 calc(-5/8 * 1em)",
                width: "calc(5/4 * 1em)",
                height: "calc(5/4 * 1em)",
                borderRadius: "100%",
                background: "hsla(var(--color-accent-1-hsl), 1.0)",
                transform: "scale(0)",
              },
                
              // 체크 이펙트
              "&:after": {
                content: "''",
                position: "absolute",
                top: "calc(5/16 * 1em)",
                left: "calc(5/16 * 1em)",
                width: "calc(1/8 * 1em)",
                height: "calc(1/8 * 1em)",
                borderRadius: "2px",
                boxShadow: "0 calc(9/8 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * 1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), 0 calc(9/8 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * -1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0)",
                transform: "scale(0)",
              },
                
              // 체크된 경우
              ".dr-task--checked &": {
                borderColor: "transparent",
                "&:before": {
                  transform: "scale(1)",
                  opacity: "0",
                  transition: "all 0.3s ease",
                },
                "&:after": {
                  transform: "scale(1)",
                  opacity: "0",
                  transition: "all 0.6s ease",
                }
              }
            }}
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
        {/* <div css={{
          position: "relative",
        }}> */}
          <Touchable
            className={bem("option")}
            onClick={onOptionMenuClick}
            css={{
              // position: "absolute",
              // top: 0,
              // right: 0,
              // zIndex: 1000,
              width: "2.5em",
              height: "100%",
              // border: "1px solid black",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              css={{
                width: "1.3em",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
          </Touchable>
        </div>
      {/* </div> */}
    </Touchable>
  )
})