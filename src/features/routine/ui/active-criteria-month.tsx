/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { RoutineProperties } from "@entities/routine";
import { Button } from "@shared/components/Button";
import { formatDayOfMonth, getDateLocale, t } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Calendar from "react-calendar";
import ReactDOM from "react-dom";

// TODO: BaseCalendar를 사용해서 리팩터링하기

// px
const tileRadius = 20;


const calendarCss = css({
  ".react-calendar": {
    width: "100%",
    maxWidth: "100%",
    lineHeight: "1.125em",
  },

  // 요일
  ".react-calendar__month-view__weekdays": {
    display: "none !important",
  },

  // 날짜 타일 flex
  ".react-calendar__month-view__days": {
    gap: "0.5em 0",

    "abbr": {
      display: "none",
    },
  },

  // 날짜 타일
  ".react-calendar__tile": {
    boxShadow: "none !important",
    cursor: "pointer !important",
    height: `${tileRadius * 2}px`,
    padding: "0",
    backgroundColor: "transparent !important",

    ".react-calendar__tile:hover": {
      backgroundColor: "var(--color-base-50)",
    }
  }
})


interface MonthOptionProps {
  className?: string;
  daysOfMonth: number[];
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
export const MonthOption = ({ className, daysOfMonth, setProperties }: MonthOptionProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // '마지막 날' 버튼을 끼워 넣을 타일 컨테이너. 다른 곳의 달력과 섞이지 않도록 이 컴포넌트 안에서만 찾는다.
  const [tilesEl, setTilesEl] = useState<Element | null>(null);
  useEffect(() => {
    setTilesEl(wrapperRef.current?.querySelector(".react-calendar__month-view__days") ?? null);
  }, []);

  const toggleDay = useCallback((day: number) => {
    if(daysOfMonth.includes(day)){
      setProperties({ daysOfMonth: daysOfMonth.filter(d => d !== day) });
    } 
    else {
      setProperties({ daysOfMonth: [...daysOfMonth, day] });
    }
  }, [daysOfMonth, setProperties]);

  const onLasyDayBtnClick = useCallback(() => {
    toggleDay(0);
  }, [toggleDay]);


  const onClickDay = useCallback((v: Date, _e: React.MouseEvent<HTMLButtonElement>) => {
    const date = v.getDate();
    toggleDay(date);
  }, [toggleDay]);


  return (
    <div 
      ref={wrapperRef}
      className={className} 
      css={{
        width: "100%",
      }}>
      <Calendar
        tileContent={({ date }) => <CalendarTile date={date} active={daysOfMonth.includes(date.getDate())} />}
        value={new Date(2024, 0, 1)}
        locale={getDateLocale()}
        // 2024년 1월은 실제 달이 아니라 날짜 번호를 늘어놓기 위한 고정 달이다. 월요일에 시작하므로 iso8601이면 앞쪽 빈 칸이 없다.
        // 주 시작 요일 설정을 따르면 일요일·토요일 시작에서 빈 칸이 생겨 1일이 밀린다.
        calendarType="iso8601"
        allowPartialRange={false}
        selectRange={false}
        showNavigation={false}
        showNeighboringMonth={false}
        onClickDay={onClickDay}
        css={calendarCss}
      />
      <LastDayOfMonthButton
        container={tilesEl}
        onClick={onLasyDayBtnClick}
        active={daysOfMonth.includes(0)}
      />
    </div>
  )
}


interface CalendarTileProps { 
  date: Date;
  active: boolean; 
}
const CalendarTile = ({ date, active }: CalendarTileProps) => {

  const activeStyle = useMemo(() => {
    if(active){
      return css({
        backgroundColor: "var(--interactive-accent) !important",
        color: "var(--text-on-accent) !important"
      })
    } else {
      return css({
        color: "var(--text-normal)"
      });
    }
  }, [active]);

  return (
    <div 
      css={[
        {
          display: "flex",
          width: `${tileRadius * 2}px`,
          height: `${tileRadius * 2}px`,
          border: "1px solid var(--color-base-50)",
          borderRadius: "50%",
          justifyContent: "center",
          alignItems: "center",
        }, 
        activeStyle
      ]}
    >
      {formatDayOfMonth(Day.fromJsDate(date))}
    </div>
  )
}



interface LastDayOfMonthButtonProps {
  className?: string;
  container: Element | null;
  active: boolean;
  onClick: (isActive: boolean) => void;
}
const LastDayOfMonthButton = (props: LastDayOfMonthButtonProps) => {
  const onClick = useCallback(() => {
    props.onClick(!props.active);
  }, [props]);

  
  if(!props.container) return null;
  return ReactDOM.createPortal(
    <Button
      className={props.className}
      onClick={onClick}
      variant={props.active ? "accent" : "primary"}
      css={css`
        display: block;
        justify-self: start;
        align-self: center;
        width: auto;
        .is-phone & {
          margin: auto;
        }
      `}
    >
      {t("tasks.criteria.lastDay")}
    </Button>,
    props.container
  )
}