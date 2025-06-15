/** @jsxImportSource @emotion/react */
import { CheckableState } from "@/entities/types/checkable";
import { Interpolation } from "@emotion/react";
import { Theme } from "@mui/material";
import { useMemo } from "react";

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
  isVisible: boolean;
}
const AccomplishCheckMark = ({
  size,
  custom,
  isVisible,
}: AccomplishCheckMarkProps) => {
  return (
    <div
      css={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: isVisible ? "scale(1)" : "scale(0)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.5s ease",
      }}
    >
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
    </div>
  )
}

type FailedCheckMarkProps = {
  size: number;
  custom?: React.ReactNode;
  isVisible: boolean;
}
const FailedCheckMark = ({
  size,
  custom,
  isVisible,
}: FailedCheckMarkProps) => {
  const x = 15;
  const y = 100 - x;
  const color = "var(--color-accent-2)";

  return (
    <div
      css={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: isVisible ? "scale(1)" : "scale(0)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.5s ease",
      }}
    >
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
        </>)}
      </CheckMarkWrapper>
    </div>
  )
}

interface Props {
  state: CheckableState;
  size?: number;
  customAccomplishedSVG?: React.ReactNode;
  customFailedSVG?: React.ReactNode;
  sx?: Interpolation<Theme>;
}

export const Checkbox = ({
  state,
  customAccomplishedSVG,
  customFailedSVG,
  size = 15,
  sx,
}: Props) => {
  const isChecked = useMemo(() => state !== "unchecked", [state]);

  return (
    <div
      css={[{
        display: "inline-block",
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        // checkbox style
        border: "0.07em solid #c8ccd4",
        borderColor: isChecked ? "transparent" : undefined,
        borderRadius: "3px",
        cursor: "pointer",
        transition: "scale",
      }, sx]}
    >
      <AccomplishCheckMark
        size={size}
        custom={customAccomplishedSVG}
        isVisible={state === "accomplished"}
      />
      <FailedCheckMark
        size={size}
        custom={customFailedSVG}
        isVisible={state === "failed"}
      />
    </div>
  )
}