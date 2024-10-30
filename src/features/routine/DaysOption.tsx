/** @jsxImportSource @emotion/react */
import { RoutineProperties } from "entities/routine";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Calendar from "react-calendar";
import { DAYS_OF_WEEK, DayOfWeek } from "shared/day";
import { dr } from "shared/daily-routine-bem";
import { Button } from "shared/components/Button";
import ReactDOM from "react-dom";
import { css } from "@emotion/react";
import "./days-of-month-calendar-style.scss";





interface DaysOptionProps {
  className?: string;
  criteria: "week" | "month";
  properties: RoutineProperties;
  setProperties: (props: RoutineProperties) => void;
}
/**
 * daysOfWeek, 또는 daysOfMonth를 설정하는 옵션 컴포넌트
 */
export const DaysOption = ({ className, properties, setProperties }: DaysOptionProps) => {  

  const bem = useMemo(() => dr("days-option"), []);
  return (
    <div className={clsx(className, bem("", {
      "week": properties.activeCriteria === "week",
      "month": properties.activeCriteria === "month"
    }))}>
      <>
        {properties.activeCriteria === "week" && 
          <WeekOption
            className={bem("week-option")}
            daysOfWeek={properties.daysOfWeek} 
            setDaysOfweek={(daysOfWeek) => setProperties({...properties, daysOfWeek})} 
          />
        }

        {properties.activeCriteria === "month" && 
          <MonthOption 
            className={bem("month-option")}
            daysOfMonth={properties.daysOfMonth} 
            setDaysOfMonth={(daysOfMonth) => setProperties({...properties, daysOfMonth})} 
          />
        }
      </>
    </div>
  )
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////



interface WeekOptionProps {
  daysOfWeek: DayOfWeek[];
  setDaysOfweek: (daysOfWeek: DayOfWeek[]) => void;
  className?: string;
}
const WeekOption = ({ daysOfWeek, setDaysOfweek, className }: WeekOptionProps) => {
  const bem = useMemo(() => dr("week-option"), []);

  // 날짜 하나하나 클릭시 선택/해제 콜백
  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const activeCn = bem("day", { active: true}).split(" ")[1];
    // 클래스 토글
    e.currentTarget.classList.toggle(activeCn);
    const isActive = e.currentTarget.classList.contains(activeCn);
    const targetYoil = DayOfWeek[e.currentTarget.getAttribute('data-day-of-week') as keyof typeof DayOfWeek];
    if(isActive){
      setDaysOfweek([...daysOfWeek, targetYoil] );
    } else {
      setDaysOfweek(daysOfWeek.filter(d => d !== targetYoil));
    }
  }, [bem, daysOfWeek, setDaysOfweek])

  return (
    <div 
      className={bem()}
      css={{
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div 
        className={bem("list")}
        css={css`
          display: flex;
          justify-content: end;
          align-items: center;
          width: 100%;
          gap: 1em;
          .is-phone & {
            justify-content: space-between;
            gap: 0;
          }
        `}
      >
        {DAYS_OF_WEEK.map((dayOfWeek, idx) => {
          const isActive = daysOfWeek.includes(dayOfWeek);
          return (
            <Button
              key={idx}
              css={css`
                .is-phone & {
                  font-size: 0.7em;
                }
                @media(max-width: 375px) {
                  .is-phone & {
                    font-size: 0.5em;
                  }
                }
              `}
              data-day-of-week={dayOfWeek} 
              onClick={onDayClick} 
              className={bem("day", {
                active: isActive
              })}
              accent={isActive}
            >
              {dayOfWeek}
            </Button>
          )
        })}
      </div>
    </div>
  )
}



/////////////////////////////////////////////////////////////////////////////////////////////

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
      accent={props.active}
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

interface MonthOptionProps {
  daysOfMonth: number[];
  setDaysOfMonth: (daysOfMonth: number[]) => void;
  className?: string;
}
const MonthOption = ({ daysOfMonth, setDaysOfMonth, className }: MonthOptionProps) => {

  // 매개변수로 날짜가 있다면 제거, 없다면 추가해주는 함수
  const toggleDay = useCallback((day: number) => {
    if(daysOfMonth.includes(day)){
      setDaysOfMonth(daysOfMonth.filter(d => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day]);
    }
  }, [daysOfMonth, setDaysOfMonth]);

  // BEM
  const bem = dr("days-of-month-option-calendar");

  const onLasyDayBtnClick = useCallback((isActive: boolean) => {
    toggleDay(0);
  }, [toggleDay]);


  // 날짜타일 클릭시 콜백
  const onClickDay = useCallback((v: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    const date = v.getDate();
    toggleDay(date);
  }, [toggleDay]);


  // 달력의 날짜 타일 하나하나를 렌더링하는 방식을 정의
  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    return (
      <Button 
        className={bem("tile")} 
        css={{
          width: "4em",
          height: "4em",
          border: "1px solid var(--color-base-50)",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        accent={daysOfMonth.includes(date.getDate())}
      >
        {date.getDate().toString()} 
      </Button>
    )
  }

  return (
    <div 
      className={clsx(className, bem())} 
      css={{
        width: "100%",
      }}>
      <Calendar
        tileContent={tileContent}
        value={new Date(2024, 0, 1)}
        allowPartialRange={false}
        selectRange={false}
        showNavigation={false}
        onClickDay={onClickDay}
      />
      <LastDayOfMonthButton
        onClick={onLasyDayBtnClick}
        active={daysOfMonth.includes(0)}
      />
    </div>
  )
}