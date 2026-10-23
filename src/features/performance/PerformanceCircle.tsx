import { NotePerformance } from "@entities/note";
import { Circle } from "@shared/components/Circle";
import { getCustomAccentHSL } from "@shared/components/obsidian-accent-color";
import React from "react";

const cleanPercentage = (percentage: number) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : (isTooHigh ? 100 : +percentage);
};


// 원 안에 한 줄로 들어가는 글자 수. 이를 넘는 이름(아랍어 요일 등)은 글자 크기를 줄여 원 밖으로 나가지 않게 한다.
const FULL_SIZE_TEXT_MAX_CHARS = 4;
const FULL_FONT_SIZE = 45;
const MIN_FONT_SIZE = 22;

const textFontSize = (text: string) => {
  const length = Array.from(text).length;
  if(length <= FULL_SIZE_TEXT_MAX_CHARS) return FULL_FONT_SIZE;
  return Math.max(MIN_FONT_SIZE, Math.floor(FULL_FONT_SIZE * FULL_SIZE_TEXT_MAX_CHARS / length));
}

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
        <Circle transition={false} color="var(--background-modifier-border)" percentage={100} />
        <Circle transition={transition} color={completion ? completionCircleColor : "transparent"} percentage={completion} />
        <Circle transition={transition} color={completion ? accomplishmentCircleColor : "transparent"} percentage={accomplishment} />
      </g>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fontSize={textFontSize(text)}
        dominantBaseline="central"
        fill="var(--text-normal)"
      >
        {text}
      </text>
    </svg>
  );
});