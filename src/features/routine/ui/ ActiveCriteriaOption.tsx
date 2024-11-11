/** @jsxImportSource @emotion/react */
import { RoutineProperties } from "entities/routine";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Calendar from "react-calendar";
import { dr } from "shared/daily-routine-bem";
import { Button } from "shared/components/Button";
import ReactDOM from "react-dom";
import { css } from "@emotion/react";
import { WeekOption } from "./WeekOption";
import { MonthOption } from "./MonthOption";




interface ActiveCriteriaOptionProps {
  className?: string;
  criteria: "week" | "month";
  properties: RoutineProperties;
  setProperties: (props: RoutineProperties) => void;
}
/**
 * daysOfWeek, 또는 daysOfMonth를 설정하는 옵션 컴포넌트
 */
export const ActiveCriteriaOption = ({ className, properties, setProperties }: ActiveCriteriaOptionProps) => {  

  const bem = useMemo(() => dr("active-criteria-option"), []);
  return (
    <div className={clsx(className, bem("", {
      "week": properties.activeCriteria === "week",
      "month": properties.activeCriteria === "month"
    }))}>
      <>
        {properties.activeCriteria === "week" && 
          <WeekOption
            className={bem("week")}
            daysOfWeek={properties.daysOfWeek} 
            setDaysOfweek={(daysOfWeek) => setProperties({...properties, daysOfWeek})} 
          />
        }

        {properties.activeCriteria === "month" && 
          <MonthOption 
            className={bem("month")}
            daysOfMonth={properties.daysOfMonth} 
            setDaysOfMonth={(daysOfMonth) => setProperties({...properties, daysOfMonth})} 
          />
        }
      </>
    </div>
  )
}
