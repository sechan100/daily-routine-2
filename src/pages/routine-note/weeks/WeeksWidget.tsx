/** @jsxImportSource @emotion/react */
import { getNoteProgress } from "@/core/note/get-note-progress";
import { VirtualSwiper } from "@/shared/components/SwiperComponent";
import { Day } from "@/shared/period/day";
import { Week } from "@/shared/period/week";
import { STYLES } from "@/shared/styles/styles";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { useRoutineNoteQuery } from "@/stores/server/use-routine-note-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import 'swiper/swiper-bundle.css';
import { DayNodeComponent } from "./DayNodeComponent";
import { loadWeekNodes } from "./load-weeks";
import { WeekNode } from "./types";
import { WeeksActiveDayContextProvider } from "./WeeksContext";



interface WeeksProps {
  className?: string;
}
export const WeeksWidget = ({
  className,
}: WeeksProps) => {
  const activeDay = useNoteDayStore(state => state.day);
  const setDay = useNoteDayStore(state => state.setDay);
  const activeWeek = useMemo(() => Week.of(activeDay), [activeDay]);
  const { note } = useRoutineNoteQuery(activeDay);
  const currentNoteProgress = useMemo(() => getNoteProgress(note), [note]);
  const [weeks, setWeeks] = useState<WeekNode[]>([]);

  /**
   * weeks 최초 초기화
   */
  useEffect(() => {
    loadWeekNodes(activeWeek, { prev: 1, next: 1 })
      .then(weeks => setWeeks(weeks))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   console.log(weeks.map(w => w.week.startDay.format()));
  // }, [weeks]);


  const loadEdgeWeek = useCallback(async (edge: "start" | "end", week: WeekNode) => {
    // edge에 로드할 week의 수. (ex: 2라면 끝에 다다랐을 때, 2주를 더 로드한다)
    const loadWeekNum = 1;
    let loadTarget: Week;
    if (edge === "start") {
      const currentEdgeWeek = Week.of(week.days[0].day);
      loadTarget = currentEdgeWeek.subtract_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    }
    else { // edge === "end"
      const currentEdgeWeek = Week.of(week.days[week.days.length - 1].day);
      loadTarget = currentEdgeWeek.add_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    }
  }, []);

  const handleDayClick = useCallback((day: Day, event?: React.MouseEvent) => {
    setDay(day);
  }, [setDay]);

  return (
    <WeeksActiveDayContextProvider
      data={{ day: activeDay, progress: currentNoteProgress }}
      onDataChange={(store, data) => store.setState(data)}
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
            backgroundColor: STYLES.palette.background,
          }}>
            {week.days.map((dayNode, idx) => (
              <DayNodeComponent
                key={idx}
                dayNode={dayNode}
                onClick={handleDayClick}
              />
            ))}
          </div>
        )}
      </VirtualSwiper>
    </WeeksActiveDayContextProvider>
  )
}