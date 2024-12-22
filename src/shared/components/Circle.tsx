import clsx from "clsx";
import React, { useEffect, useState } from "react";


interface CircleProps {
  color: string;
  percentage: number;
  transition: boolean;
}
export const Circle = ({ color, percentage: propsPercentage, transition=true }: CircleProps) => {
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