/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useMemo, useCallback } from "react";
import { Button } from "@shared/components/Button";
import { dr } from "@shared/daily-routine-bem";
import { DayOfWeek, DAYS_OF_WEEK } from "@shared/day";

interface WeekOptionProps {
  daysOfWeek: DayOfWeek[];
  setDaysOfweek: (daysOfWeek: DayOfWeek[]) => void;
  className?: string;
}
export const WeekOption = ({ daysOfWeek, setDaysOfweek, className }: WeekOptionProps) => {
  const bem = useMemo(() => dr("week-option"), []);

  const onDayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const activeCn = bem("day", { active: true }).split(" ")[1];
    // 클래스 토글
    e.currentTarget.classList.toggle(activeCn);
    const isActive = e.currentTarget.classList.contains(activeCn);
    const targetYoil = DayOfWeek[e.currentTarget.getAttribute('data-day-of-week') as keyof typeof DayOfWeek];
    if (isActive) {
      setDaysOfweek([...daysOfWeek, targetYoil]);
    } else {
      setDaysOfweek(daysOfWeek.filter(d => d !== targetYoil));
    }
  }, [bem, daysOfWeek, setDaysOfweek]);

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
              css={{
                fontSize: "0.7em",
                width: "47px",
                height: "47px",
                border: "1px solid var(--color-base-50)",
                borderRadius: "50%",
                justifyContent: "center",
                alignItems: "center",
              }}
              data-day-of-week={dayOfWeek}
              onClick={onDayClick}
              className={bem("day", { active: isActive })}
              variant={isActive ? "accent" : "primary"}
            >
              {dayOfWeek}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
