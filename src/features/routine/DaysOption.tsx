/** @jsxImportSource @emotion/react */
import { RoutineProperties } from "entities/routine";
import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import Calendar from "react-calendar";
import { DAYS_OF_WEEK, DayOfWeek } from "shared/day";
import { ButtonComponent } from "obsidian";
import "./days-of-month-calendar-style.scss";
import { Button } from "shared/components/Button";
import { dr } from "shared/daily-routine-bem";





interface DaysOptionProps {
  className?: string;
  properties: RoutineProperties;
  setProperties: (props: RoutineProperties) => void;
}
/**
 * daysOfWeek, 또는 daysOfMonth를 설정하는 옵션 컴포넌트
 */
export const DaysOption = ({ className, properties, setProperties }: DaysOptionProps) => {


  // activeCriteria 변경 콜백
  const changeActiveCriteria = useCallback((criteria: "week" | "month") => {
    setProperties({
      ...properties,
      activeCriteria: criteria
    });
  }, [properties, setProperties]);
  

  return (
    <>
      <div>
        <Button onClick={() => changeActiveCriteria("week")}>Week</Button>
        <Button onClick={() => changeActiveCriteria("month")}>Month</Button>
      </div>
      <>
        {properties.activeCriteria === "week" && 
          <DaysOfWeekOption 
            daysOfWeek={properties.daysOfWeek} 
            setDaysOfweek={(daysOfWeek) => setProperties({...properties, daysOfWeek})} 
          />
        }

        {properties.activeCriteria === "month" && 
          <DaysOfMonthOption 
            daysOfMonth={properties.daysOfMonth} 
            setDaysOfMonth={(daysOfMonth) => setProperties({...properties, daysOfMonth})} 
          />
        }
      </>
    </>
  )
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////



interface DaysOfWeekOptionProps {
  daysOfWeek: DayOfWeek[];
  setDaysOfweek: (daysOfWeek: DayOfWeek[]) => void;
}
const DaysOfWeekOption = ({ daysOfWeek, setDaysOfweek }: DaysOfWeekOptionProps) => {

  // 날짜 하나하나 클릭시 선택/해제 콜백
  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.currentTarget.classList.toggle("dr-routine-option-days__day--active");
    const isActive = e.currentTarget.classList.contains("dr-routine-option-days__day--active");
    const targetDOW = DayOfWeek[e.currentTarget.getAttribute('data-day-of-week') as keyof typeof DayOfWeek];
    if(isActive){
      setDaysOfweek([...daysOfWeek, targetDOW] );
    } else {
      setDaysOfweek(daysOfWeek.filter(d => d !== targetDOW));
    }
  }, [daysOfWeek, setDaysOfweek])

  return (
    <div className={clsx("dr-routine-option-days")}>
      <h6>Days</h6>
      <div className="dr-routine-option-days__list">
        {DAYS_OF_WEEK.map((dayOfWeek, idx) => {
          const isActive = daysOfWeek.includes(dayOfWeek);
          return (
            <button key={idx} data-day-of-week={dayOfWeek} onClick={onDayClick} className={clsx(
              "dr-routine-option-days__day",
              {"dr-routine-option-days__day--active": isActive})}
            >
              {dayOfWeek}
            </button>
          )
        })}
      </div>
    </div>
  )
}





/////////////////////////////////////////////////////////////////////////////////////////////
interface DaysOfMonthOptionProps {
  daysOfMonth: number[];
  setDaysOfMonth: (daysOfMonth: number[]) => void;
}
const DaysOfMonthOption = ({ daysOfMonth, setDaysOfMonth }: DaysOfMonthOptionProps) => {



  // 받은 날짜가 있다면 제거 없다면 추가해주는 함수
  const toggleDay = useCallback((day: number) => {
    if(daysOfMonth.includes(day)){
      setDaysOfMonth(daysOfMonth.filter(d => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day]);
    }
  }, [daysOfMonth, setDaysOfMonth]);

  // BEM 선언
  const bem = dr("days-of-month-option-calendar");


  // 달력의 빈 공간에 Last Day of Month 버튼을 추가
  const lastDayBtn = useRef<ButtonComponent>(null);
  useEffect(() => {
    const calendarFlex = document.querySelector(".react-calendar__month-view__days");
    if(!calendarFlex) return;

    const div = document.createElement("div");
    calendarFlex.appendChild(div);
    div.setCssStyles({
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      flexGrow: "1",
    });

    const cn = bem("last-day-tile", {
      active: daysOfMonth.includes(0)
    }).split(" ");

    const btn = new ButtonComponent(div)
    // @ts-ignore
    lastDayBtn.current = btn;
    btn.setClass(cn[0])
    if(cn[1]) btn.setClass(cn[1])

    btn.setButtonText("Last Day of Month")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 리렌더링시 재실행하지 않음


  // onClick 이벤트를 등록. 해당 로직은 toggleDay 함수가 변경되었을 때, 같이 변경해주지 않으면 버그가 발생하기에 따로 떼어서 리렌더링
  useEffect(() => {
    if(!lastDayBtn.current) return;
    // 클릭시 0일로 추가/제거 , 배경색 토글
    lastDayBtn.current.onClick((e) => {
      // @ts-ignore
      e.currentTarget.classList.toggle(bem("last-day-tile", "active").split(" ")[1]);
      toggleDay(0);
    })
  }, [bem, toggleDay]);


  // 날짜타일 클릭시 콜백
  const onClickDay = useCallback((v: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    const date = v.getDate();
    toggleDay(date);
  }, [toggleDay]);


  // 달력의 날짜 타일 하나하나를 렌더링하는 방식을 정의
  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    return (
      <div 
        className={bem("tile")} 
        css={{
          width: "4em",
          height: "4em",
          border: "1px solid var(--color-base-50)",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: daysOfMonth.includes(date.getDate()) ? "var(--color-accent-1)" : "transparent",
        }}
      >
        {date.getDate().toString()} 
      </div>
    )
  }

  return (
    <div 
      className={bem()} 
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
    </div>
  )
}