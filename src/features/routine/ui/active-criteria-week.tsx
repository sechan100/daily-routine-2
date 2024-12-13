/** @jsxImportSource @emotion/react */
import { useCallback } from "react";
import { Button } from "@shared/components/Button";
import { DayOfWeek, Day } from "@shared/period/day";
import { RoutinePropertiesDto } from "@entities/routine";


interface WeekOptionProps {
  className?: string;
  daysOfWeek: DayOfWeek[];
  setProperties: (properties: Partial<RoutinePropertiesDto>) => void;
}
export const WeekOption = ({ className, daysOfWeek, setProperties }: WeekOptionProps) => {
  
  const toggleDOW = useCallback((dow: DayOfWeek) => {
    const isContain = daysOfWeek.includes(dow);
    if(isContain) {
      setProperties({ daysOfWeek: daysOfWeek.filter(d => d !== dow) });
    }
    else {
      setProperties({ daysOfWeek: [...daysOfWeek, dow] });
    }
  }, [daysOfWeek, setProperties]);

  const onDayClick = useCallback((dow: DayOfWeek) => {
    toggleDOW(dow);
  }, [toggleDOW]);

  return (
    <div
      className={className}
      css={{
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        width: "100%",
        gap: "1em",
        ".is-phone &": {
          justifyContent: "space-between",
          gap: 0,
        }
      }}
    >
      {Day.getDaysOfWeek().map((dow, idx) => {
        const isActive = daysOfWeek.includes(dow);
        return (
          <Button
            key={idx}
            css={{
              fontSize: "0.7em",
              width: "47px",
              height: "47px",
              border: "1px solid var(--color-base-50)",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => onDayClick(dow)}
            variant={isActive ? "accent" : "primary"}
          >
            {dow}
          </Button>
        );
      })}
    </div>
  );
};
