/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { TaskState } from "@entities/note";
import { Icon } from "@shared/components/Icon";
import { dr } from "@shared/utils/daily-routine-bem";
import { useMemo } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";


const bem = dr("task-cbx")

const CheckMarkWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <svg
      viewBox="0 0 14 12"
      css={{
        position: "relative",
        width: "calc(7/8 * 1em)",
        height: "calc(3/4 * 1em)",
        top: "calc(-1/16 * 1em)",
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    >
      {children}
    </svg>
  )
}

const AccomplishCheckMark = () => {
  return (
    <CheckMarkWrapper>
      <polyline
        points="1 7.6 5 11 13 1"
        css={{
          strokeWidth: 2,
          stroke: "var(--color-accent-1)"
        }}
      />
    </CheckMarkWrapper>
  )
}

const FailedCheckMark = () => {
  return (
    <CheckMarkWrapper>
      <polyline
        points="1 1 10 10"
        css={{
          strokeWidth: 2,
          stroke: "var(--color-accent-1)"
        }}
      />
      <polyline
        points="10 1 1 10"
        css={{
          strokeWidth: 2,
          stroke: "var(--color-accent-1)"
        }}
      />
    </CheckMarkWrapper>
  )
}



interface Props {
  state: TaskState;
}
export const Checkbox = ({ state }: Props) => {
  const isChecked = useMemo(() => state !== "un-checked", [state]);
  return (          
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
        borderColor: isChecked ? "transparent" : undefined,
        borderRadius: "3px",
        cursor: "pointer",
        transition: "scale",
          
        // 체크될 때 이펙트
        "&::after": {
          content: "''",
          position: "absolute",
          top: "calc(5/16 * 1em)",
          left: "calc(5/16 * 1em)",
          width: "calc(1/8 * 1em)",
          height: "calc(1/8 * 1em)",
          borderRadius: "2px",
          boxShadow: "0 calc(9/8 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * 1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * 1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), 0 calc(9/8 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * 1em) 0 hsla(var(--color-accent-1-hsl), 1.0), calc(9/8 * -1em) 0 0 hsla(var(--color-accent-1-hsl), 1.0), calc(3/4 * -1em) calc(3/4 * -1em) 0 hsla(var(--color-accent-1-hsl), 1.0)",
          transform: "scale(0)",
          ...(isChecked && {
            transform: "scale(1)",
            opacity: "0",
            transition: "all 0.6s ease",
          })
        },

        // transition
        "& .fade-enter": {
          transform: "scale(0)",
          opacity: 0,
        },

        "& .fade-enter-active": {
          transform: "scale(1)",
          opacity: 1,
          transition: "all 0.5s ease",
        },
      }}
    >
      <CSSTransition
        in={state === "accomplished"}
        key="accomplish"
        timeout={500}
        exit={false}
        classNames="fade"
        unmountOnExit
        children={<AccomplishCheckMark />}
      />
      <CSSTransition
        in={state === "failed"}
        key="failed"
        timeout={500}
        exit={false}
        classNames="fade"
        unmountOnExit
        children={<FailedCheckMark />}
      />
    </span>
  )
}