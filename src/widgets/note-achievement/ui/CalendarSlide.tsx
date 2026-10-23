/** @jsxImportSource @emotion/react */
import { NoteEntity, NotePerformance, noteRepository } from "@entities/note";
import { BaseCalendar, CalendarStyleOptions, calendarSkeletonCss, TODAY_SOFT_BG } from "@shared/components/BaseCalendar";
import { Circle } from "@shared/components/Circle";
import { StatChips, STAT_CHIPS_HEIGHT } from "@shared/components/StatChips";
import { countCalendarWeeks, layoutCalendarRows } from "@shared/components/swipeable-calendar/calendar-grid";
import { useSlideHeight } from "@shared/components/swipeable-calendar/SwipeableCalendar";
import { formatNumber, formatPercent, t } from "@shared/i18n";
import { Day, DayFormat } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/utils/use-async";
import { useCallback, useMemo } from "react";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useToday } from "@shared/today/use-today";
import { PerformanceCircle } from "@features/performance";
import { NoteMonthSummarizer } from "../model/month-summary";


// 원이 이보다 작아지면 날짜를 읽기 어려우므로, 슬라이드 안에서 스크롤한다.
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

const fillCss = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
} as const;


type NoteTileProps = {
  day: Day;
  isToday: boolean;
  performance: NotePerformance;
  maxHeight: number;
  loading: boolean;
}
const NoteTile = ({ day, isToday, performance, maxHeight, loading }: NoteTileProps) => {
  return (
    <div css={[{
      position: "relative",
      width: "100%",
      // 너비가 좁으면 너비에, 높이가 모자라면 행 높이에 맞춰 원 크기가 정해진다.
      aspectRatio: "1 / 1",
      minHeight: 0,
      maxHeight,
    }, isToday && {
      "& text": {
        fill: "var(--text-accent)",
        fontWeight: "bold",
      },
    }, loading && calendarSkeletonCss]}>
      {isToday && (
        <Circle
          css={fillCss}
          color="transparent"
          percentage={0}
          transition={false}
          fill={TODAY_SOFT_BG}
        />
      )}
      <PerformanceCircle
        css={fillCss}
        performance={performance}
        text={formatNumber(day.date)}
      />
    </div>
  )
}


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
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

  const performances = useMemo(() => {
    const map = new Map<DayFormat, NotePerformance>();
    notes?.forEach(note => map.set(note.day.format(), NoteEntity.getPerformance(note)));
    return map;
  }, [notes]);

  const summary = useMemo(() => NoteMonthSummarizer.summarize(
    (notes ?? []).map(note => ({ day: note.day, tasks: NoteEntity.flatten(note) })),
    month,
    today,
  ), [month, notes, today]);

  const tile = useCallback((day: Day) => {
    if(day.month !== month.monthNum) return <></>;
    return (
      <NoteTile
        day={day}
        isToday={day.isSameDay(today)}
        performance={performances.get(day.format()) ?? NoteEntity.getEmptyNotePerformance()}
        maxHeight={layout.rowHeight}
        loading={loading}
      />
    )
  }, [layout.rowHeight, loading, month.monthNum, performances, today]);
  

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
        loading={loading}
        stats={[
          {
            label: t("stats.note.done"),
            value: formatPercent(summary.accomplishment / 100),
            hint: t("stats.note.doneHint"),
            accent: true,
          },
          {
            label: t("stats.note.perfectDays"),
            value: formatNumber(summary.perfectDays),
            hint: t("stats.note.perfectDaysHint"),
          },
          {
            label: t("stats.note.daysTracked"),
            value: formatNumber(summary.trackedDays),
            hint: t("stats.note.daysTrackedHint"),
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
