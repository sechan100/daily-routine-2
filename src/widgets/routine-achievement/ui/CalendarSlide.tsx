/** @jsxImportSource @emotion/react */

import { isRoutineTask, NoteEntity, noteRepository, TaskState } from "@entities/note";
import { BaseCalendar, CalendarStyleOptions } from "@shared/components/BaseCalendar";
import { StatChips, STAT_CHIPS_HEIGHT } from "@shared/components/StatChips";
import { countCalendarWeeks, layoutCalendarRows } from "@shared/components/swipeable-calendar/calendar-grid";
import { useSlideHeight } from "@shared/components/swipeable-calendar/SwipeableCalendar";
import { formatNumber, t } from "@shared/i18n";
import { Day, DayFormat } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useToday } from "@shared/today/use-today";
import { useAsync } from "@shared/utils/use-async";
import { useCallback, useEffect, useMemo } from "react";
import { useRoutineStreak } from "../model/routine-streak-context";
import { RoutineStreakCalculator } from "../model/streak";
import { useRoutineSelector } from "../model/use-routine-selector";
import { CalendarTile } from "./CalendarTile";


// 원이 이보다 작아지면 날짜와 체크 표시를 읽기 어려우므로, 슬라이드 안에서 스크롤한다.
const MIN_ROW_HEIGHT = 30;

const STYLE_OPTIONS: CalendarStyleOptions = {
  tileContainer: {
    gap: "0",
  },
  tile: {
    border: "0",
    overflow: "visible !important",
    // 타일이 정사각형이 아닐 수 있어 배경 대신 원 자체를 흐리게 해서 hover를 표시한다.
    "&:hover:enabled": {
      backgroundColor: "transparent",
      opacity: 0.75,
    },
  },
};


interface Props {
  month: Month;
}
export const CalendarSlide = ({
  month,
}: Props) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const { currentRoutine, addRoutineOptionsPerMonth } = useRoutineSelector();
  const streak = useRoutineStreak();
  const route = useTabRoute(s=>s.route);
  const slideHeight = useSlideHeight();
  const today = useToday(s => s.today);

  const layout = useMemo(() => layoutCalendarRows({
    slideHeight,
    rows: countCalendarWeeks(month),
    minRowHeight: MIN_ROW_HEIGHT,
    reserved: STAT_CHIPS_HEIGHT,
  }), [month, slideHeight]);

  // 다시 불러오는 동안에는 이전 값을 그대로 보여주고, 처음 불러올 때만 스켈레톤을 보여준다.
  const notes = notesAsync.value ?? null;
  const loading = !notes && !notesAsync.error;

  const occurrences = useMemo(() => RoutineStreakCalculator.collectOccurrences(
    (notes ?? []).map(note => ({ day: note.day, tasks: NoteEntity.flatten(note) })),
    currentRoutine,
  ), [currentRoutine, notes]);

  const stateByDay = useMemo(() => {
    return new Map<DayFormat, TaskState>(occurrences.map(o => [o.day.format(), o.state]));
  }, [occurrences]);

  const summary = useMemo(() => RoutineStreakCalculator.summarizeMonth(occurrences, month, today), [month, occurrences, today]);


  // routineOptions를 계산하여 routineOptionsPerMonth에 반영한다. (upsert이므로 새로 생긴 루틴도 반영됨)
  useEffect(() => {
    if(!notes) return;

    const existingRoutineNames = notes.flatMap(note => NoteEntity
      .flatten(note)
      .filter(isRoutineTask)
      .map(routine => routine.name)
    );
    const routineOptions = Array.from(new Set(existingRoutineNames));
    addRoutineOptionsPerMonth(month.format(), routineOptions);
  }, [addRoutineOptionsPerMonth, month, notes]);


  const tile = useCallback((day: Day) => {
    if(day.month !== month.monthNum) return <></>;
    return (
      <CalendarTile
        tile={{ day, state: stateByDay.get(day.format()) ?? "inactive" }}
        today={today}
        maxHeight={layout.rowHeight}
        loading={loading}
      />
    );
  }, [layout.rowHeight, loading, month.monthNum, stateByDay, today]);


  const onTileClick = useCallback((day: Day) => {
    route("note", { day });
  }, [route]);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);


  return (
    <div
      // 최소 크기로도 다 들어가지 않는 짧은 창에서는 슬라이드 안에서 스크롤한다. (스크롤이 월 이동으로 먹히지 않게 swiper 제스처를 끈다)
      className={layout.scroll ? "swiper-no-mousewheel swiper-no-swiping" : undefined}
      css={{
        height: "100%",
        overflowY: layout.scroll ? "auto" : "hidden",
      }}
    >
      <StatChips
        loading={loading || !streak}
        stats={[
          {
            label: t("stats.routine.done"),
            value: `${formatNumber(summary.done)}/${formatNumber(summary.scheduled)}`,
            hint: t("stats.routine.doneHint"),
            accent: true,
          },
          {
            label: t("stats.routine.streak"),
            value: formatNumber(streak?.current ?? 0),
            hint: t("stats.routine.streakHint"),
          },
          {
            label: t("stats.routine.best"),
            value: formatNumber(streak?.longest ?? 0),
            hint: t("stats.routine.bestHint"),
          },
        ]}
      />
      <BaseCalendar
        month={month}
        setMonth={() => {}}
        onTileClick={onTileClick}
        tile={tile}
        showNavigation={false}
        tileDisabled={tileDisabled}
        styleOptions={STYLE_OPTIONS}
      />
    </div>
  );
};
