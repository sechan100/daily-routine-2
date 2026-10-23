/** @jsxImportSource @emotion/react */
import { useRoutineNote } from "@features/note";
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Day } from "@shared/period/day";
import { Week } from "@shared/period/week";
import { useLeaf } from "@shared/view/use-leaf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { DayNodeComponent } from "./DayNodeComponent";
import { loadWeekNodes } from "./load-weeks";
import { DayNode, WeekNode } from "./types";
import { WeeksActiveDayContextProvider } from "./WeeksContext";
import { NoteEntity } from "@entities/note";


// 주간 바의 높이. 주 데이터를 불러오기 전에도 같은 높이를 차지해서 아래 내용이 밀리지 않게 한다.
export const WEEKS_WIDGET_HEIGHT = "5em";

const replaceActiveDay = (store: StoreApi<DayNode>, data: DayNode) => store.setState(data);


interface WeeksProps {
  className?: string;
  /**
   * 값이 바뀌면, 보이는 주가 선택된 날의 주가 아닐 때 그 주로 되돌린다.
   * (선택된 날이 그대로인데 다른 주로 넘겨둔 상태에서 '오늘로 이동'한 경우)
   */
  recenterSignal?: number;
}
export const WeeksWidget = ({ className, recenterSignal = 0 }: WeeksProps) => {
  const note = useRoutineNote(s => s.note);
  const setNote = useRoutineNote(s => s.setNote);
  const activeDay = note.day;
  const activeDayKey = activeDay.format();
  const currentNotePerformance = useMemo(() => NoteEntity.getPerformance(note), [note]);
  const activeDayData = useMemo<DayNode>(() => ({
    day: activeDay,
    performance: currentNotePerformance
  }), [activeDay, currentNotePerformance]);
  const [ weeks, setWeeks ] = useState<WeekNode[]>([]);
  const { leafBgColor } = useLeaf();

  // 지금 화면에 보이는 주의 시작일. 사용자가 swipe하면 바뀐다.
  const shownWeekKeyRef = useRef<string | null>(null);
  const onWeekShown = useCallback((week: WeekNode) => {
    shownWeekKeyRef.current = week.week.startDay.format();
  }, []);

  /**
   * 최초 로드, 그리고 선택된 날이 보이는 주 밖으로 바뀌었을 때(오늘로 이동, 명령으로 이전/다음 날 이동, 자정 경과 등)
   * 선택된 날의 주를 가운데로 해서 다시 불러온다.
   */
  useEffect(() => {
    const activeWeek = Week.of(Day.fromString(activeDayKey));
    const activeWeekKey = activeWeek.startDay.format();
    if(shownWeekKeyRef.current === activeWeekKey) return;

    let cancelled = false;
    loadWeekNodes(activeWeek, { prev: 1, next: 1 })
      .then(loaded => {
        if(cancelled) return;
        shownWeekKeyRef.current = activeWeekKey;
        setWeeks(loaded);
      })
      .catch((e: unknown) => {
        console.error("[Daily Routine] Failed to load weeks.", e);
      });
    return () => { cancelled = true; };
  }, [activeDayKey, recenterSignal]);


  const loadEdgeWeek = useCallback(async (edge: "start" | "end", week: WeekNode) => {
    // edge에 로드할 week의 수. (ex: 2라면 끝에 다다랐을 때, 2주를 더 로드한다)
    const loadWeekNum = 1;
    let loadTarget: Week;
    if(edge === "start"){
      const currentEdgeWeek = Week.of(week.days[0].day);
      loadTarget = currentEdgeWeek.subtract_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    }
    else { // edge === "end"
      const currentEdgeWeek = Week.of(week.days[week.days.length-1].day);
      loadTarget = currentEdgeWeek.add_cpy(loadWeekNum);
      return await loadWeekNodes(loadTarget);
    }
  }, []);

  const onDayClick = useCallback((day: Day) => {
    setNote(day);
  }, [setNote]);

  return (
    <WeeksActiveDayContextProvider
      data={activeDayData}
      onDataChange={replaceActiveDay}
    >
      <div css={{ height: WEEKS_WIDGET_HEIGHT, flexShrink: 0 }}>
        <VirtualSwiper
          datas={weeks}
          getKey={w => w.week.startDay.format()}
          loadEdgeData={loadEdgeWeek}
          onSlideChange={onWeekShown}
          className={className}
        >
          {week => (
            <div css={{
              display: "flex",
              height: WEEKS_WIDGET_HEIGHT,
              maxWidth: "470px",
              margin: "0 auto",
              padding: "0 4px",
              gap: "2px",
              boxSizing: "border-box",
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
      </div>
    </WeeksActiveDayContextProvider>
  )
}
