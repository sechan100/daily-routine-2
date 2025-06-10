/** @jsxImportSource @emotion/react */
import { Button } from "@/shared/components/Button";
import { Day, DayOfWeek } from "@/shared/period/day";
import { useCallback } from "react";


interface WeekUnitControlProps {
  daysOfWeek: DayOfWeek[];
  onDaysOfWeekChange: (days: DayOfWeek[]) => void;
}
export const WeekUnitControl = ({
  daysOfWeek,
  onDaysOfWeekChange,
}: WeekUnitControlProps) => {

  const toggleDow = useCallback((dow: DayOfWeek) => {
    const isContain = daysOfWeek.includes(dow);
    if (isContain) {
      onDaysOfWeekChange(daysOfWeek.filter(d => d !== dow));
    }
    else {
      onDaysOfWeekChange([...daysOfWeek, dow]);
    }
  }, [daysOfWeek, onDaysOfWeekChange]);

  const onDayClick = useCallback((dow: DayOfWeek) => {
    toggleDow(dow);
  }, [toggleDow]);

  return (
    <div
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
