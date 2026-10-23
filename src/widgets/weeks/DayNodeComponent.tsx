/** @jsxImportSource @emotion/react */
import { formatMonthDayNumeric, formatWeekdayShort } from "@shared/i18n";
import { Day } from "@shared/period/day";
import React, { useEffect, useMemo, useState } from "react";
import { DayNode } from "./types";
import { dr } from "@shared/utils/daily-routine-bem";
import { useWeeksActiveDay } from "./WeeksContext";
import { PerformanceCircle } from "@features/performance";
import { useToday } from "@shared/today/use-today";


const bem = dr("weeks");

// 한 칸이 37px 안팎이라, 한국어의 "10. 23."처럼 공백이 낀 표기는 공백을 지워 칸을 아낀다. (en "10/23", ko "10.23.", de "23.10.")
const formatCompactMonthDay = (day: Day): string => formatMonthDayNumeric(day).replace(/\s+/g, "");

interface DayNodeProps {
  dayNode: DayNode;
  onClick: (day: Day, event?: React.MouseEvent) => void;
}
export const DayNodeComponent = React.memo(({ dayNode: { day, performance: _performance }, onClick }: DayNodeProps) => {
  // 자정을 넘기면 갱신되어 오늘 표시와 미래 날짜 흐림이 따라 바뀐다.
  const today = useToday(s => s.today);
  const isToday = day.isSameDay(today);
  const isFuture = day.wholeDayDiff(today) > 0;

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

  return (
    <div
      className={bem("day", { today: isToday, active: isActiveDay, future: isFuture })}
      aria-current={isToday ? "date" : undefined}
      css={{
        // 7칸이 좁은 사이드바에서도 잘리지 않도록 폭을 균등하게 나누고, 내용 때문에 늘어나지 않게 한다.
        flex: "1 1 0",
        minWidth: 0,
        // 날짜 문구의 글자 크기를 칸 폭에 맞추기 위한 기준(cqw)
        containerType: "inline-size",
        height: "100%",
        padding: "3px 1.5px",
        cursor: "pointer",
        borderRadius: "var(--radius-m)",
        transition: "background-color 120ms ease-out",
        ...(isActiveDay && {
          backgroundColor: "var(--background-modifier-hover)",
          boxShadow: "inset 0 0 0 1.5px var(--interactive-accent)",
        }),
        "@media (hover: hover)": {
          "&:hover": {
            backgroundColor: "var(--background-modifier-hover)",
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
        },
      }}
      onClick={(e) => onClick(day, e)}
    >
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.3em",
          height: "100%",
          // 아직 오지 않은 날은 흐리게
          opacity: isFuture ? 0.45 : 1,
        }}
      >
        <div
          css={{
            textAlign: "center",
            // 언어마다 날짜 문구 길이가 다르므로, 좁은 칸에서는 칸 폭에 맞춰 줄인다. (container query 미지원 환경은 앞의 값을 쓴다)
            fontSize: ["0.75em", "min(0.75em, 33cqw)"],
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: isToday ? "var(--text-accent)" : "var(--text-muted)",
            fontWeight: isToday ? "var(--font-bold)" : undefined,
          }}
        >
          {formatCompactMonthDay(day)}
        </div>
        <PerformanceCircle
          css={{
            display: "block",
            // 넓은 pane에서 원이 줄 높이를 넘지 않도록
            maxWidth: "3.25em",
          }}
          width="100%"
          performance={performance}
          text={formatWeekdayShort(day)}
        />
      </div>
    </div>
  )
});
