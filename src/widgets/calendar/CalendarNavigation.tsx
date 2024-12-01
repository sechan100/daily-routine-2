/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useLeaf } from "@shared/view/use-leaf";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef } from "react";
import Calendar from "react-calendar";
import { OnArgs, TileArgs } from "react-calendar/dist/cjs/shared/types";




export interface CalendarNavigationProps {
  month: Month;
  onMonthChange?: (month: Month) => void;
  className?: string;
}
export const CalendarNavigation = ({ 
  month, 
  onMonthChange,
  className,
}: CalendarNavigationProps) => {
  const { leafBgColor } = useLeaf();
  const calendarRef = useRef(null);

  useEffect(() => {
    if(!calendarRef.current) return;
    // @ts-ignore
    calendarRef.current.setActiveStartDate(month.startDay.getJsDate());
  }, [month]);
  
  const onActiveStartDateChange = useCallback(({ activeStartDate, view }: OnArgs) => {
    if(!activeStartDate || view !== "month") return;
    const changedMonth = Month.fromJsDate(activeStartDate);
    if(!changedMonth.startDay.isSameMonth(month.startDay)){
      onMonthChange?.(changedMonth);
    }
  }, [month.startDay, onMonthChange]);

  const calendarStyles = useMemo(() => css({
    // 네비게이션
    '.react-calendar__navigation': {
      display: 'flex',
      'button:disabled': {
        backgroundColor: 'var(--color-base-10)',
      },
    },

    // 캘린더 + 월, 년 선택 컨테이너
    ".react-calendar__viewContainer": {
      position: "relative",
      zIndex: 10,
      
      "div": {
        position: "absolute",
        left: 0,
        right: 0,
        // Shadow
        "::after": {
          content: "''",
          display: "block",
          position: "absolute",
          width: "100%",
          top: 0,
          bottom: 0,
          transform: "translateY(10%)",
          zIndex: -1,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          filter: "blur(30px)",
        },

        // flex 컨테이너
        "div": {
          display: "flex",
          alignItems: "center",
          flexFlow: "column !important",

          // flex item
          "button": {
            display: "block",
            borderRadius: "0",
            borderBottom: "0.5px solid var(--color-base-40)",
            backgroundColor: leafBgColor,
            fontSize: "1em",
            padding: "10px 0",
            overflow: "visible !important",
            width: "90%",
            height: "auto",
          },

          // flex item 시작과 마지막
          "button:nth-child(1)": {
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
            borderTop: "0.5px solird var(--color-base-40)",
          },
  
          "button:nth-last-child(1)": {
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
          },
        },
      },
    },
  
    // 캘린더
    ".react-calendar__month-view": {
      display: 'none',
    },
  }), [leafBgColor]);

  
  return (
    <>
      <Calendar
        ref={calendarRef}
        className={className}
        css={calendarStyles}
        defaultValue={month.startDay.getJsDate()}
        allowPartialRange={false}
        onActiveStartDateChange={onActiveStartDateChange}
        selectRange={false}
        showNavigation={true}
      />
    </>
  )
}