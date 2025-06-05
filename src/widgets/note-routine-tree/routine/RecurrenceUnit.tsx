/** @jsxImportSource @emotion/react */
import { Routine, RoutineProperties } from "@/entities/routine-like";
import { TEXT_CSS } from "@/shared/colors/text-style";
import { Button } from "@/shared/components/Button";
import { dr } from "@/shared/utils/daily-routine-bem";
import { useMemo } from "react";
import { MonthOption } from "./recurrence-unit-month";
import { WeekOption } from "./recurrence-unit-week";


interface RecurrenceUnitProps {
  className?: string;
  routine: Routine;
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
/**
 * daysOfWeek, 또는 daysOfMonth를 설정하는 옵션 컴포넌트
 */
export const RecurrenceUnit = ({ className, routine, setProperties }: RecurrenceUnitProps) => {
  const unit = useMemo(() => routine.properties.recurrenceUnit, [routine]);
  const bem = useMemo(() => dr("active-criteria"), []);
  return (
    <div className={bem("", "", className)}>
      <header
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1em",
        }}
        className={bem("header")}
      >
        <div css={TEXT_CSS.medium}>Recurrence unit</div>
        <nav className={bem("nav")}>
          <Button
            css={{ marginRight: "0.5em" }}
            variant={unit === "week" ? "accent" : "primary"}
            onClick={() => setProperties({ recurrenceUnit: "week" })}
          >Week
          </Button>
          <Button
            variant={unit === "month" ? "accent" : "primary"}
            onClick={() => setProperties({ recurrenceUnit: "month" })}
          >Month
          </Button>
        </nav>
      </header>
      <div
        className={bem("tiles", {
          "week": unit === "week",
          "month": unit === "month"
        })}
      >{unit === "week" ?
        <WeekOption daysOfWeek={routine.properties.daysOfWeek} setProperties={setProperties} />
        :
        <MonthOption daysOfMonth={routine.properties.daysOfMonth} setProperties={setProperties} />
        }</div>
    </div>
  )
}
