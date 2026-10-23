/** @jsxImportSource @emotion/react */
import { TaskState } from "@entities/note";
import { dr } from "@shared/utils/daily-routine-bem";
import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";


const bem = dr("task-cbx")

// CSSTransition이 붙이는 클래스(-enter, -enter-active, -exit, -exit-active)의 접두사
const MARK_CLASS = "dr-task-cbx-mark";
const MARK_ENTER_MS = 180;
const MARK_EXIT_MS = 120;

// CSSTransition의 nodeRef는 HTMLElement여야 하므로 svg를 span으로 감싸 애니메이션 대상으로 쓴다.
const CheckMarkWrapper = React.forwardRef<HTMLSpanElement, { children: React.ReactNode, size: number }>(
  ({ children, size }, ref) => {
    return (
      <span
        ref={ref}
        css={{
          // accomplished <-> failed가 바뀔 때 두 마크가 잠깐 겹치므로 서로 밀어내지 않게 띄운다.
          position: "absolute",
          top: 0,
          left: 0,
          display: "block",
          width: size,
          height: size,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          css={{
            display: "block",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
        >
          {children}
        </svg>
      </span>
    )
  }
)
CheckMarkWrapper.displayName = "CheckMarkWrapper";

const AccomplishCheckMark = () => {
  return (
    <polyline
      points="7 54 35 78 92 7"
      css={{
        strokeWidth: 15,
        stroke: "var(--color-accent-1)"
      }}
    />
  )
}

const FailedCheckMark = () => {
  const x = 15;
  const y = 100 - x;
  const color = "var(--color-accent-2)";
  return (<>
    <polyline
      points={`${x} ${x} ${y} ${y}`}
      css={{
        strokeWidth: 15,
        stroke: color,
      }}
    />
    <polyline
      points={`${y} ${x} ${x} ${y}`}
      css={{
        strokeWidth: 15,
        stroke: color,
      }}
    />
  </>)
}



interface Props {
  state: TaskState;
  className?: string;
  size?: number;
  customAccomplishedSVG?: React.ReactNode;
  customFailedSVG?: React.ReactNode;
}
export const TaskCheckbox = ({
  state,
  className,
  customAccomplishedSVG,
  customFailedSVG,
  size = 15,
}: Props) => {
  const isChecked = state !== "un-checked";
  // findDOMNode(StrictMode 경고)를 피하려고 CSSTransition에 노드를 직접 알려준다.
  const accomplishRef = useRef<HTMLSpanElement>(null);
  const failedRef = useRef<HTMLSpanElement>(null);
  return (
    <div
      className={bem("cbx", "", className)}
      css={{
        display: "inline-block",
        position: "relative",
        // 이름이 길어도 체크박스가 찌그러지지 않게
        flexShrink: 0,
        width: `${size}px`,
        height: `${size}px`,

        // checkbox style
        border: "0.07em solid var(--background-modifier-border)",
        borderColor: isChecked ? "transparent" : undefined,
        borderRadius: "3px",
        cursor: "pointer",
        transition: "border-color 120ms ease-out",

        // 체크: 살짝 튀어나왔다 자리잡는 pop-in, 해제: 빠르게 fade-out
        [`& .${MARK_CLASS}-enter`]: {
          transform: "scale(0.4)",
          opacity: 0,
        },
        [`& .${MARK_CLASS}-enter-active`]: {
          transform: "scale(1)",
          opacity: 1,
          transition: `transform ${MARK_ENTER_MS}ms cubic-bezier(.34, 1.56, .64, 1), opacity ${MARK_EXIT_MS}ms ease-out`,
        },
        [`& .${MARK_CLASS}-exit`]: {
          transform: "scale(1)",
          opacity: 1,
        },
        [`& .${MARK_CLASS}-exit-active`]: {
          transform: "scale(0.8)",
          opacity: 0,
          transition: `transform ${MARK_EXIT_MS}ms ease-out, opacity ${MARK_EXIT_MS}ms ease-out`,
        },

        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          [`& .${MARK_CLASS}-enter-active, & .${MARK_CLASS}-exit-active`]: {
            transition: "none",
          },
        },
      }}
    >
      <CSSTransition
        nodeRef={accomplishRef}
        in={state === "accomplished"}
        timeout={{ enter: MARK_ENTER_MS, exit: MARK_EXIT_MS }}
        classNames={MARK_CLASS}
        unmountOnExit
      >
        <CheckMarkWrapper ref={accomplishRef} size={size}>
          {customAccomplishedSVG ?? <AccomplishCheckMark />}
        </CheckMarkWrapper>
      </CSSTransition>
      <CSSTransition
        nodeRef={failedRef}
        in={state === "failed"}
        timeout={{ enter: MARK_ENTER_MS, exit: MARK_EXIT_MS }}
        classNames={MARK_CLASS}
        unmountOnExit
      >
        <CheckMarkWrapper ref={failedRef} size={size}>
          {customFailedSVG ?? <FailedCheckMark />}
        </CheckMarkWrapper>
      </CSSTransition>
    </div>
  )
}
