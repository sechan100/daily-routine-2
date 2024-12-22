/** @jsxImportSource @emotion/react */
import { Day } from "@shared/period/day";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DayNode } from "./types";
import { dr } from "@shared/daily-routine-bem";
import { useLeaf } from "@shared/view/use-leaf";
import { css } from "@emotion/react";
import { useWeeksActiveDay } from "./WeeksContext";
import { PerformanceCircle } from "@features/performance";



interface DayNodeProps {
  dayNode: DayNode;
  onClick: (day: Day, event?: React.MouseEvent) => void;
}
export const DayNodeComponent = React.memo(({ dayNode: { day, performance: _performance }, onClick }: DayNodeProps) => {
  const { leafBgColor } = useLeaf();
  // const isToday = useMemo(() => day.isSameDay(Day.now()), [day]);

  const activeNode = useWeeksActiveDay();
  const isActiveDay = useMemo(() => day.isSameDay(activeNode.day), [activeNode.day, day]);
  const [performance, setPerformance] = useState(_performance);

  /**
   * percentage를 적절하게 업데이트한다.
   * 해당 컴포넌트가 active된 상태에서는 percentage가 변경될 수 있다.
   * 이 때, 변경된 percentage를 보존하여 active가 해제되어도 마지막 변경을 기억하여, 원래의 percentage로 돌아가지 않도록 한다.
   */
  useEffect(() => {
    if(isActiveDay){
      setPerformance(activeNode.performance);
    }
  }, [isActiveDay, activeNode.performance]);

  const afterStyle = useMemo(() => {
    if(!day.isAfter(Day.now())) return css({});
    return css({
      content: "''",
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      borderRadius: "7px",
      backgroundColor: leafBgColor,
      opacity: "0.7",
    })
  }, [day, leafBgColor]);

  const activeStyle = useMemo(() => {
    if(!isActiveDay) return { self: {}, after: {} };
    return {
      self: { boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5)" },
      after: { boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5)" },
    }
  }, [isActiveDay]);

  const bem = dr("weeks");
  return (
    <div
      className={bem("day")}
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "0.3em",
        position: "relative",
        height: "100%",
        padding: "3px 1.5px",
        cursor: "pointer",
        borderRadius: "7px",
        "&::after": [afterStyle, activeStyle.after],
        ...activeStyle.self,
      }}
      onClick={(e) => onClick(day, e)}
    >
    <div
      css={{
        textAlign: "center",
        fontSize: "0.8em",
        height: "1em",
      }}
    >
      {day.format("M/D").toUpperCase()}
    </div>
    <PerformanceCircle
      css={{
        position: "relative",
        bottom: "0px",
      }}
      width="100%"
      performance={performance}
      text={day.format("ddd").toUpperCase()} 
    />
  </div>
  )
});