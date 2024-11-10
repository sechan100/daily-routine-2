import clsx from "clsx";
import React from "react";

const cleanPercentage = (percentage: number) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : (isTooHigh ? 100 : +percentage);
};


interface CircleProps {
  color: string;
  percentage: number;
  transition: boolean;
}
const Circle = ({ color, percentage, transition=true }: CircleProps) => {
  const r = 85;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - percentage) * circ) / 100; // where stroke will start, e.g. from 15% to 100%.
  const transitionString = transition ? "all 0.7s ease-in-out" : "none";
  return (
    <circle
      style={{
        position: "relative",
        transition: transitionString,
      }}
      r={r}
      cx={100}
      cy={100}
      stroke={color}
      strokeDasharray={circ}
      strokeWidth={25}
      strokeDashoffset={strokePct}
      strokeLinecap="butt"
      fill="transparent"
    ></circle>
  );
};

interface PercentageCircleProps {
  percentage: number;
  text: string;
  transition?: boolean;
  width?: string;
  className?: string;
}
export const PercentageCircle = React.memo(({ percentage, width, className,  text, transition=true }: PercentageCircleProps) => {
  const pct = cleanPercentage(percentage);
  const color = pct > 70 ? "var(--color-accent-1)" : "var(--color-accent-2)";
  return (
    <svg width={width??"100%"} data-percentage={percentage} viewBox="0 0 200 200" className={clsx(className, "dr-percentage-circle")}>
      <g transform="rotate(-90 100 100)" >
        <Circle transition={false} color="#ececec" percentage={100} />
        <Circle transition={transition} color={color} percentage={pct} />
      </g>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fontSize="45"
        dominantBaseline="central"
      >
        {text}
      </text>
    </svg>
  );
});