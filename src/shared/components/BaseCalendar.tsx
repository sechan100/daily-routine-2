/** @jsxImportSource @emotion/react */
import { css, CSSObject, keyframes } from '@emotion/react';
import { DR_SETTING } from "@app/settings/setting-provider";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useLeaf } from "@shared/view/use-leaf";
import { formatDayOfWeek, getDateLocale } from "@shared/i18n";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import { OnArgs, TileArgs } from "react-calendar/dist/cjs/shared/types";
import { getCustomAccentHSL } from "./obsidian-accent-color";
import { CALENDAR_TYPE_BY_WEEK_START, CALENDAR_WEEKDAYS_HEIGHT } from "./swipeable-calendar/calendar-grid";
import { allShortWeekdayLabels, pickWeekdayStyle, WeekdayLabelStyle } from "./swipeable-calendar/weekday-labels";


// 오늘 날짜 강조용 옅은 accent 배경. 테마의 accent 색을 따라간다.
export const TODAY_SOFT_BG = getCustomAccentHSL({ a: 0.18 });

const skeletonPulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.45 },
});

// 데이터를 불러오는 동안 같은 크기의 그리드를 보여줄 때 쓰는 깜빡임. 동작 줄이기 설정에서는 멈춘다.
export const calendarSkeletonCss = css({
  animation: `${skeletonPulse} 1.2s ease-in-out infinite`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});


export interface BaseCalendarProps {
  month: Month;
  setMonth: Dispatch<SetStateAction<Month>>;
  tile: (day: Day) => React.JSX.Element;
  className?: string;
  onTileClick?: (day: Day) => void;
  showNavigation?: boolean;
  tileDisabled?: (day: Day) => boolean;
  styleOptions?: CalendarStyleOptions;
  // 주(행) 하나의 높이(px). 지정하지 않으면 타일 내용 높이를 따른다.
  rowHeight?: number;
}
/**
 * 요일 머리글 이름의 길이를 칸 너비에 맞춘다. 사이드바가 좁을 때 긴 요일 이름(아랍어 등)은 한 글자 이름으로 바꾼다.
 */
const useWeekdayLabelStyle = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<WeekdayLabelStyle>("short");

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if(!wrapper) return;
    const update = () => {
      const weekdaysEl = wrapper.querySelector(".react-calendar__month-view__weekdays");
      const fontSize = weekdaysEl ? parseFloat(getComputedStyle(weekdaysEl).fontSize) : NaN;
      setStyle(pickWeekdayStyle(allShortWeekdayLabels(), wrapper.clientWidth / 7, Number.isFinite(fontSize) ? fontSize : undefined));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return { wrapperRef, style };
}


export const BaseCalendar = ({ 
  month, 
  setMonth,
  className,
  tile, 
  onTileClick,
  showNavigation,
  tileDisabled: propsTileDisabled,
  styleOptions: styleOptions,
  rowHeight,
}: BaseCalendarProps) => {
  const calendarStyles = useBaseCalendarStyles(styleOptions??{}, rowHeight);
  const { wrapperRef, style: weekdayLabelStyle } = useWeekdayLabelStyle();

  const onChangeMonth = useCallback(({ activeStartDate }: OnArgs) => {
    if(!activeStartDate) return;
    setMonth(Month.fromJsDate(activeStartDate));
  }, [setMonth]);

  const renderTileContent = useCallback(({ date, view }: { date: Date, view: string }) => {
    if (view !== "month") return null;
    return tile(Day.fromJsDate(date));
  }, [tile]);

  const onClickDay = useCallback((date: Date) => {
    if (!onTileClick) return;
    onTileClick(Day.fromJsDate(date));
  }, [onTileClick]);

  const tileDisabled = useCallback(({ date }: TileArgs) => {
    if (!propsTileDisabled) return false;
    return propsTileDisabled(Day.fromJsDate(date));
  }, [propsTileDisabled]);

  const formatShortWeekday = useCallback((_locale: string | undefined, date: Date) => {
    return formatDayOfWeek(Day.fromJsDate(date).dow, weekdayLabelStyle);
  }, [weekdayLabelStyle]);

  return (
    <div ref={wrapperRef}>
      <Calendar
        // 주 시작 요일 설정을 따라간다. (iso8601: 월요일 시작, gregory: 일요일 시작, islamic: 토요일 시작)
        // react-calendar의 calendarType은 요일 배치만 바꾸고, 날짜 자체는 항상 양력으로 그린다.
        calendarType={CALENDAR_TYPE_BY_WEEK_START[DR_SETTING.weekStartDow()]}
        // 지정하지 않으면 OS 언어를 따르므로 Obsidian 언어로 고정한다. 양력으로 표기하는 로케일이다.
        locale={getDateLocale()}
        formatShortWeekday={formatShortWeekday}
        className={className}
        css={calendarStyles}
        tileContent={renderTileContent}
        defaultValue={month.startDay.getJsDate()}
        allowPartialRange={false}
        onActiveStartDateChange={onChangeMonth}
        selectRange={false}
        showNavigation={showNavigation}
        onClickDay={onClickDay}
        tileDisabled={tileDisabled}
      />
    </div>
  )
}


export type CalendarStyleOptions = {
  nav?: CSSObject;
  weekdays?: CSSObject;
  weekdayEach?: CSSObject;
  tileContainer?: CSSObject;
  tile?: CSSObject;
  neighboringMonthTile?: CSSObject;
}
const useBaseCalendarStyles = ({ 
  nav: navStyle = {},
  weekdays: weekdaysStyle = {},
  weekdayEach: weekdayEachStyle = {},
  tileContainer: tileContainerStyle = {},
  tile: tileStyle = {},
  neighboringMonthTile: neighboringMonthTileStyle = {},
}: CalendarStyleOptions, rowHeight?: number) => {
  const { leafBgColor } = useLeaf();
  const calendarStyles = useMemo(() => css({
    // 네비게이션
    '.react-calendar__navigation': {
      display: 'flex',
      'button:disabled': {
        backgroundColor: 'var(--background-modifier-hover)',
      },
      ...navStyle,
    },
  
    // 월화수목금토일 표시. 행 높이 계산에 쓰이므로 높이를 고정한다.
    '.react-calendar__month-view__weekdays': {
      height: CALENDAR_WEEKDAYS_HEIGHT,
      alignItems: 'center',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 'var(--font-ui-smaller)',
      ...weekdaysStyle,
  
      // 개별 요일 글자 컨테이너
      div: {
        // 실제 글자
        abbr: {
          textDecoration: 'none',
        },
        ...weekdayEachStyle,
      },
    },
  
    // 월뷰의 날짜 타일 컨테이너
    '.react-calendar__month-view__days': {
      gap: '5px 0',
      ...tileContainerStyle,
  
      // 타일
      '.react-calendar__tile': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: '0 !important',
        boxShadow: 'none !important',
        borderRadius: 0,
        height: rowHeight ?? 'auto',
        width: '100%',
        background: 'none',
        color: 'var(--text-normal)',
        cursor: 'pointer',

        '&:hover:enabled': {
          backgroundColor: 'var(--background-modifier-hover)',
        },
        '&:disabled': {
          cursor: 'default',
        },
        '&:focus-visible': {
          outline: '2px solid var(--background-modifier-border-focus)',
          outlineOffset: '-2px',
        },

        ...tileStyle,
      },
  
      // 내부 원래 글씨
      abbr: {
        display: 'none',
      },
    },
  
    // 이웃한 달의 날짜
    '.react-calendar__month-view__days__day--neighboringMonth': {
      position: 'relative',
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        backgroundColor: leafBgColor,
        opacity: 0.8,
        zIndex: 100,
      },
      ...neighboringMonthTileStyle,
    }
  }), [leafBgColor, navStyle, neighboringMonthTileStyle, rowHeight, tileContainerStyle, tileStyle, weekdayEachStyle, weekdaysStyle]);

  return calendarStyles;
}
