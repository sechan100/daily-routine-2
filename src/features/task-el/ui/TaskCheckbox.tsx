/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { TaskState } from "@entities/note";
import { Icon } from "@shared/components/Icon";
import { getCustomAccentHSL } from "@shared/components/obsidian-accent-color";
import { dr } from "@shared/utils/daily-routine-bem";
import { useMemo } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";


const bem = dr("task-cbx")

const CheckMarkWrapper = ({ children, size }: { children: React.ReactNode, size: number }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      css={{
        position: "relative",
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    >
      {children}
    </svg>
  )
}

type AccomplishCheckMarkProps = {
  size: number;
  custom?: React.ReactNode;
}
const AccomplishCheckMark = ({
  size,
  custom,
}: AccomplishCheckMarkProps) => {
  return (
    <CheckMarkWrapper size={size}>
      {custom ?? (
        <polyline
          points="7 54 35 78 92 7"
          css={{
            strokeWidth: 15,
            stroke: "var(--color-accent-1)"
          }}
        />
      )}
    </CheckMarkWrapper>
  )
}

type FailedCheckMarkProps = {
  size: number;
  custom?: React.ReactNode;
}
const FailedCheckMark = ({
  size,
  custom,
}: FailedCheckMarkProps) => {
  const x = 15;
  const y = 100 - x;
  const color = "var(--color-accent-2)";
  return (
    <CheckMarkWrapper size={size}>
      {custom ?? (<>
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
        {/* 삼각형은 어떻니 */}
        {/* <polyline
          points="50 0 0 90 90 90 50 0"
          css={{
            strokeWidth: 15,
            stroke: "var(--color-accent-2)"
          }}
        /> */}
      </>)}
    </CheckMarkWrapper>
  )
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
  const isChecked = useMemo(() => state !== "un-checked", [state]);
  return (
    <div
      className={bem("cbx", "", className)}
      css={{
        display: "inline-block",
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,

        // checkbox style
        border: "0.07em solid #c8ccd4",
        borderColor: isChecked ? "transparent" : undefined,
        borderRadius: "3px",
        cursor: "pointer",
        transition: "scale",

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
        children={
          <AccomplishCheckMark 
            size={size}
            custom={customAccomplishedSVG}
          />
        }
      />
      <CSSTransition
        in={state === "failed"}
        key="failed"
        timeout={500}
        exit={false}
        classNames="fade"
        unmountOnExit
        children={
          <FailedCheckMark 
            size={size}
            custom={customFailedSVG}
          />
        }
      />
    </div>
  )
}