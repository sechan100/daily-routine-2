/** @jsxImportSource @emotion/react */
import { useRoutineNote } from "@features/note";
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Day } from "@shared/period/day";
import { Week } from "@shared/period/week";
import { useLeaf } from "@shared/view/use-leaf";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import 'swiper/swiper-bundle.css';
import { DayNodeComponent } from "./DayNodeComponent";
import { loadWeekNodes } from "./load-weeks";
import { WeekNode } from "./types";
import { WeeksActiveDayContextProvider } from "./WeeksContext";



interface WeeksProps {
  day: Day;
  // 현재 보고있는 routineNote의 percentage는 실시간으로 변할 수 있기 때문에 props로 받아서 반영
  currentDayPercentage: number;
  onDayClick?: (day: Day, event?: React.MouseEvent) => void;
  className?: string;
}
export const WeeksWidget = ({ day: activeDay, currentDayPercentage, onDayClick: p_onDayClick, className }: WeeksProps) => {
  const [ weeks, setWeeks ] = useState<WeekNode[]>([]);
  const activeWeek = useMemo(() => new Week(activeDay), [activeDay]);
  const setNote = useRoutineNote(s => s.setNote);
  const { leafBgColor } = useLeaf();

  /**
   * weeks 최초 초기화
   */
  useEffect(() => {
    loadWeekNodes(activeWeek, {prev: 1, next: 1})
    .then(weeks => setWeeks(weeks))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadEdgeWeek = useCallback(async (edge: "start" | "end", week: WeekNode) => {
    // edge에 로드할 week의 수. (ex: 2라면 끝에 다다랐을 때, 2주를 더 로드한다)
    const loadWeekNum = 1;
    let loadTarget: Week;
    if(edge === "start"){
      const currentEdgeWeek = new Week(week.days[0].day);
      loadTarget = currentEdgeWeek.subtract_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    } 
    else { // edge === "end"
      const currentEdgeWeek = new Week(week.days[week.days.length-1].day);
      loadTarget = currentEdgeWeek.add_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    }
  }, []);


  const onDayClick = useCallback((day: Day, event?: React.MouseEvent) => {
    setNote(day)
    if(p_onDayClick) p_onDayClick(day, event);
  }, [p_onDayClick, setNote]);


  return (
    <WeeksActiveDayContextProvider 
      data={{ day: activeDay, percentage: currentDayPercentage }}
      onDataChange={(store, { day, percentage}) => store.setState({ day, percentage })}
    >
      <VirtualSwiper
        datas={weeks}
        getKey={w => w.week.startDay.format()}
        loadEdgeData={loadEdgeWeek}
        className={className}
      >
        {week => (
          <div css={{
            display: "flex",
            height: "5em",
            maxWidth: "470px",
            minWidth: "300px",
            margin: "0 auto",
            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "nowrap",
            backgroundColor: leafBgColor,
          }}>
            {week.days.map((dayNode, idx) => (
              <DayNodeComponent
                key={idx}
                dayNode={dayNode}
                onClick={onDayClick}
              />
            ))}
          </div>
        )}
      </VirtualSwiper>
    </WeeksActiveDayContextProvider>
  )
}