/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { formatMonthYear, getDateLocale, t } from "@shared/i18n";
import { Month } from "@shared/period/month";
import { useLeaf } from "@shared/view/use-leaf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import { OnArgs, View } from "react-calendar/dist/cjs/shared/types";




export interface CalendarNavigationProps {
  month: Month;
  setMonth: (month: Month) => void;
  className?: string;
}
export const CalendarNavigation = ({ 
  month, 
  setMonth,
  className,
}: CalendarNavigationProps) => {
  const { leafBgColor } = useLeaf();
  const calendarRef = useRef(null);

  useEffect(() => {
    if(!calendarRef.current) return;
    // @ts-expect-error -- react-calendar가 타입에 노출하지 않는 내부 인스턴스 메서드
    calendarRef.current.setActiveStartDate(month.startDay.getJsDate());
  }, [month]);

  // 버튼 툴팁은 월 화면일 때만 의미가 분명하다. (연도·10년 화면에서는 같은 버튼이 이동 단위가 다르다)
  const [view, setView] = useState<View>("month");
  const isMonthView = view === "month";

  const lastChangedMonthRef = useRef<Month>(month);
  const monthChangeHandler = useCallback((month: Month) => {
    if(lastChangedMonthRef.current.isSameMonth(month)) return;
    setMonth?.(month);
    lastChangedMonthRef.current = month;
  }, [setMonth]);

  const calendarStyles = useMemo(() => css({
    // 네비게이션
    '.react-calendar__navigation': {
      display: 'flex',
      'button:disabled': {
        backgroundColor: 'var(--background-modifier-hover)',
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
          backgroundColor: "var(--background-modifier-box-shadow)",
          filter: "blur(30px)",
        },

        // flex 컨테이너
        "div": {
          display: "flex",
          alignItems: "center",
          flexFlow: "wrap !important",

          // flex item
          "button": {
            display: "block",
            borderRadius: "0",
            borderBottom: "0.5px solid var(--background-modifier-border)",
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
            borderTop: "0.5px solid var(--background-modifier-border)",
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
        // 지정하지 않으면 OS 언어를 따르므로 Obsidian 언어로 고정한다. 양력으로 표기하는 로케일이다.
        locale={getDateLocale()}
        formatMonthYear={(_locale, date) => formatMonthYear(Month.fromJsDate(date))}
        prevAriaLabel={isMonthView ? t("stats.nav.previousMonth") : undefined}
        nextAriaLabel={isMonthView ? t("stats.nav.nextMonth") : undefined}
        prev2AriaLabel={isMonthView ? t("stats.nav.previousYear") : undefined}
        next2AriaLabel={isMonthView ? t("stats.nav.nextYear") : undefined}
        onViewChange={({ view: nextView }) => setView(nextView)}
        className={className}
        css={calendarStyles}
        defaultValue={month.startDay.getJsDate()}
        allowPartialRange={false}
        onActiveStartDateChange={({ activeStartDate, view }: OnArgs) => {
          if(!activeStartDate || view !== "month") return;
          const newMonth = Month.fromJsDate(activeStartDate);
          monthChangeHandler(newMonth);
        }}
        onClickMonth={value => {
          const month = Month.fromJsDate(value);
          monthChangeHandler(month);
        }}
        selectRange={false}
        showNavigation={true}
      />
    </>
  )
}