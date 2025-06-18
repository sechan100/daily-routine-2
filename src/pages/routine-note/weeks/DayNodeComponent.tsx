/** @jsxImportSource @emotion/react */
import { NoteProgressCircle } from "@/components/note/NoteProgressCircle";
import { Day } from "@/shared/period/day";
import { STYLES } from "@/shared/styles/styles";
import { css } from "@emotion/react";
import React, { useEffect, useMemo, useState } from "react";
import { DayNode } from "./types";
import { useWeeksActiveDay } from "./WeeksContext";



interface DayNodeProps {
  dayNode: DayNode;
  onClick: (day: Day, event?: React.MouseEvent) => void;
}
export const DayNodeComponent = React.memo(({ dayNode: { day, progress: _progress }, onClick }: DayNodeProps) => {
  // const isToday = useMemo(() => day.isSameDay(Day.now()), [day]);

  const activeNode = useWeeksActiveDay();
  const isActiveDay = useMemo(() => day.isSameDay(activeNode.day), [activeNode.day, day]);
  const [progress, setProgress] = useState(_progress);

  /**
   * percentage를 적절하게 업데이트한다.
   * 해당 컴포넌트가 active된 상태에서는 percentage가 변경될 수 있다.
   * 이 때, 변경된 percentage를 보존하여 active가 해제되어도 마지막 변경을 기억하여, 원래의 percentage로 돌아가지 않도록 한다.
   */
  useEffect(() => {
    if (isActiveDay) {
      setProgress(activeNode.progress);
    }
  }, [isActiveDay, activeNode.progress]);

  const afterStyle = useMemo(() => {
    if (!day.isAfter(Day.today())) return css({});
    return css({
      content: "''",
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      borderRadius: "7px",
      backgroundColor: STYLES.palette.background,
      opacity: "0.7",
    })
  }, [day]);

  const activeStyle = useMemo(() => {
    if (!isActiveDay) return { self: {}, after: {} };
    return {
      self: { boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5)" },
      after: { boxShadow: "inset 0 0 2px 0.5px rgba(0, 0, 0, 0.5)" },
    }
  }, [isActiveDay]);

  return (
    <div
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
      <NoteProgressCircle
        css={{
          position: "relative",
          bottom: "0px",
        }}
        width="100%"
        progress={progress}
        text={day.format("ddd").toUpperCase()}
      />
    </div>
  )
});