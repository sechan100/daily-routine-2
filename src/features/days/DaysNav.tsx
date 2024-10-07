import { Day } from "shared/day";
import clsx from "clsx";
import React from "react";
import "./style.scss";


interface DaysNavProps {
  currentDay: Day;
  onDayClick: (day: Day, event?: React.MouseEvent) => void;
}
export const DaysNav = ({ currentDay, onDayClick }: DaysNavProps) => {

  const today = Day.now();
  
  return (
    <div className="dr-days">
      <div className="dr-days__flex">
        {today.getCurrentWeek().map((day, idx) => {
          return (
            <button
              key={idx} 
              className={clsx("dr-days__item", 
              {
                "dr-days__today": day.isSameDay(today),
                "dr-days__current": day.isSameDay(currentDay)
              })}
              onClick={(e) => onDayClick(day, e)}>
              <div>{day.format("ddd")}</div>
              <div>{day.format("M/D")}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}