/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { RoutineProperties } from "@entities/routine";
import { Button } from "@shared/components/Button";
import clsx from "clsx";
import { useState, useMemo, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import ReactDOM from "react-dom";

// TODO: BaseCalendar를 사용해서 리팩터링하기

// px
const tileRadius = 20;

const calendarCss = css({
  ".react-calendar": {
    width: "100%",
    maxWidth: "100%",
    background: "white",
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
    
    // 다음달의 1, 2, 3, 4일 타일은 안보이게
    "button:nth-child(32), button:nth-child(33), button:nth-child(34), button:nth-child(35)": {
      display: "none",
    }
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
      className={className} 
      css={{
        width: "100%",
      }}>
      <Calendar
        tileContent={({ date }) => <CalendarTile date={date} active={daysOfMonth.includes(date.getDate())} />}
        value={new Date(2024, 0, 1)}
        allowPartialRange={false}
        selectRange={false}
        showNavigation={false}
        onClickDay={onClickDay}
        css={calendarCss}
      />
      <LastDayOfMonthButton
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
        color: "black"
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
      {date.getDate().toString()} 
    </div>
  )
}



interface LastDayOfMonthButtonProps {
  className?: string;
  active: boolean;
  onClick: (isActive: boolean) => void;
}
const LastDayOfMonthButton = (props: LastDayOfMonthButtonProps) => {
  const [element, setElement] = useState<Element>();

  const calendarTileFlexCn = useMemo(() => ".react-calendar__month-view__days", []);
  useEffect(() => {
    const calendarTileFlex = document.querySelector(calendarTileFlexCn);
    if(!calendarTileFlex) return;
    setElement(calendarTileFlex);
  }, [calendarTileFlexCn]);


  const activeCn = useMemo(() => `${props.className}--active`, [props.className]);
  
  const onClick = useCallback((e: React.MouseEvent) => {
    props.onClick(!props.active);
    e.currentTarget.classList.toggle(activeCn);
  }, [activeCn, props]);

  
  if(!element) return null;
  return ReactDOM.createPortal(
    <Button
      className={clsx(props.className, {
        activeCn: props.active
      })}
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
      Last Day of Month
    </Button>,
    element
  )
}