import { NotePerformance } from "@entities/note";
import { Circle } from "@shared/components/Circle";
import { getCustomAccentHSL } from "@shared/components/obsidian-accent-color";
import React from "react";

const cleanPercentage = (percentage: number) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : (isTooHigh ? 100 : +percentage);
};


const completionCircleColor = getCustomAccentHSL({
  h: 1,
  s: 1,
  l: 1.2,
  a: 1,
})
const accomplishmentCircleColor = "hsl(var(--color-accent-hsl))";


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
    <svg width={width??"100%"} viewBox="0 0 200 200" className={className}>
      <g transform="rotate(-90 100 100)" >
        <Circle transition={false} color="#ececec" percentage={100} />
        <Circle transition={transition} color={completion ? completionCircleColor : "transparent"} percentage={completion} />
        <Circle transition={transition} color={completion ? accomplishmentCircleColor : "transparent"} percentage={accomplishment} />
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