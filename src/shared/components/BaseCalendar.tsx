/** @jsxImportSource @emotion/react */
import { Day } from "@shared/day";
import Calendar from "react-calendar"
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { OnArgs, TileArgs } from "react-calendar/dist/cjs/shared/types";
import { css } from '@emotion/react';




export interface BaseCalendarProps {
  day: Day;
  setDay: Dispatch<SetStateAction<Day>>;
  tile: (day: Day) => JSX.Element;
  className?: string;
  onTileClick?: (day: Day) => void;
  showWeekdays?: boolean;
  showNavigation?: boolean;
  tileDisabled?: (day: Day) => boolean;
}
export const BaseCalendar = ({ 
  day, 
  setDay,
  className, 
  tile, 
  onTileClick,
  showWeekdays,
  showNavigation,
  tileDisabled: propsTileDisabled,
}: BaseCalendarProps) => {
  const calendarStyles = useBaseCalendarStyles({
    showWeekdays: showWeekdays ?? true,
  })

  const onChangeMonth = ({ activeStartDate }: OnArgs) => {
    if(!activeStartDate) return;
    setDay(Day.fromJsDate(activeStartDate));
  }

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

  return (
    <>
      <Calendar
        className={className}
        css={calendarStyles}
        tileContent={renderTileContent}
        defaultValue={day.getJsDate()}
        allowPartialRange={false}
        onActiveStartDateChange={onChangeMonth}
        selectRange={false}
        showNavigation={showNavigation}
        onClickDay={onClickDay}
        tileDisabled={tileDisabled}
      />
    </>
  )
}


interface BaseCalendarStylesProps {
  showWeekdays: boolean;
}
const useBaseCalendarStyles = ({ showWeekdays }: BaseCalendarStylesProps) => {
  const calendarStyles = useMemo(() => css({
    // 네비게이션
    '.react-calendar__navigation': {
      display: 'flex',
      'button:disabled': {
        backgroundColor: 'var(--color-base-10)',
      },
    },
  
    // 월화수목금토일 표시
    '.react-calendar__month-view__weekdays': {
      textAlign: 'center',
      padding: '10px 0',
  
      // 개발 요일 글자 컨테이너
      div: {
        // 실제 글자
        abbr: {
          textDecoration: 'none',
        },
      },
    },
  
    // 월뷰의 날짜 타일 컨테이너
    '.react-calendar__month-view__days': {
      gap: '5px 0',
  
      // 타일
      '.react-calendar__tile': {
        padding: '0 !important',
        boxShadow: 'none !important',
        height: 'auto',
        maxHeight: '80px',
        background: 'none',
  
        '&:hover': {
          backgroundColor: 'var(--color-base-20)',
        },
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
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--background-primary)',
        opacity: 0.8,
      },
    }
  }), []);

  return calendarStyles;
}