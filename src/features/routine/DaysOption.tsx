import clsx from "clsx";
import { useCallback } from "react";
import { DAY_OF_WEEKS, DayOfWeek } from "shared/day";





interface DaysOptionProps {
  className?: string;
  getDays: () => DayOfWeek[];
  onDaysChange: (action: "add" | "remove", day: DayOfWeek) => void;
}
export const DaysOption = ({ className, getDays, onDaysChange }: DaysOptionProps) => {
  // 날짜 하나하나 클릭시
  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.currentTarget.classList.toggle("dr-routine-option-days__day--active");
    const isActive = e.currentTarget.classList.contains("dr-routine-option-days__day--active");
    const dayOfWeek = DayOfWeek[e.currentTarget.getAttribute('data-day-of-week') as keyof typeof DayOfWeek];
    if(isActive){
      onDaysChange("add", dayOfWeek);
    } else {
      onDaysChange("remove", dayOfWeek);
    }
  }, [onDaysChange])

  return (
    <div className={clsx(className, "dr-routine-option-days")}>
      <h6>Days</h6>
      <div className="dr-routine-option-days__list">
        {DAY_OF_WEEKS.map((dayOfWeek, idx) => {
          const isActive = getDays().includes(dayOfWeek);
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