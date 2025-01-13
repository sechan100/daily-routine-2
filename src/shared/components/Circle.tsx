/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";


interface CircleProps {
  color: string;
  percentage: number;
  transition?: boolean;
  width?: string;
  strokeWidth?: number;
  className?: string;
  rotate?: number;
  fill?: string;
}
export const Circle = ({
  color, 
  percentage: propsPercentage, 
  transition = true,
  width,
  strokeWidth = 25,
  className,
  rotate,
  fill,
}: CircleProps) => {
  const [percentage, setPercentage] = useState(transition ? 0 : propsPercentage);

  const r = 85;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - percentage) * circ) / 100; // where stroke will start, e.g. from 15% to 100%.
  const transitionString = transition ? "all 0.7s ease-in-out" : "none";

  useEffect(() => {
    if(percentage !== propsPercentage){
      setPercentage(propsPercentage);
    }
  }, [percentage, propsPercentage, transition]);

  return (
    <svg 
      width={width??"100%"}
      data-percentage={percentage}
      viewBox="0 0 200 200"
      className={className}
      css={{
        transform: `rotate(${rotate??0}deg)`,
      }}
    >
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
        strokeWidth={strokeWidth}
        strokeDashoffset={strokePct}
        strokeLinecap="butt"
        fill={fill ?? "transparent"}
      />
    </svg>
  );
};