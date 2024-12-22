import { NotePerformance } from "@entities/note";
import { Circle } from "@shared/components/Circle";
import clsx from "clsx";
import React from "react";

const cleanPercentage = (percentage: number) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : (isTooHigh ? 100 : +percentage);
};


const completionCircleColor = "hsla(var(--color-accent-2-hsl), 1)";
const accomplishmentCircleColor = "hsla(var(--color-accent-hsl), 1)";


interface PercentageCircleProps {
  performance: NotePerformance;
  text: string;
  transition?: boolean;
  width?: string;
  className?: string;
}
export const PerformanceCircle = React.memo(({
  performance,
  width,
  className,
  text,
  transition=true
}: PercentageCircleProps) => {
  const accomplishment = cleanPercentage(performance.accomplishment);
  const completion = cleanPercentage(performance.completion);
  return (
    <svg width={width??"100%"} data-percentage={completion} viewBox="0 0 200 200" className={className}>
      <g transform="rotate(-90 100 100)" >
        <Circle transition={false} color="#ececec" percentage={100} />
        <Circle transition={transition} color={completionCircleColor} percentage={completion} />
        <Circle transition={transition} color={accomplishmentCircleColor} percentage={accomplishment} />
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