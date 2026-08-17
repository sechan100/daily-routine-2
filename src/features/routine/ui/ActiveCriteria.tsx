/** @jsxImportSource @emotion/react */
import { useMemo} from "react";
import { dr } from "@shared/utils/daily-routine-bem";
import { Button } from "@shared/components/Button";
import { WeekOption } from "./active-criteria-week";
import { MonthOption } from "./active-criteria-month";
import { IntervalOption } from "./active-criteria-interval";
import { TEXT_CSS } from "@shared/components/text-style";
import { Routine, RoutineProperties } from "@entities/routine";


interface ActiveCriteriaProps {
  className?: string;
  routine: Routine;
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
/**
 * daysOfWeek, 또는 daysOfMonth를 설정하는 옵션 컴포넌트
 */
export const ActiveCriteria = ({ className, routine, setProperties }: ActiveCriteriaProps) => {  
  const activeCriteria = useMemo(() => routine.properties.activeCriteria, [routine]);


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
        <div css={TEXT_CSS.medium}>Active criteria</div>
        <nav className={bem("nav")}>
          <Button
            css={{marginRight: "0.5em"}}
            variant={activeCriteria === "week" ? "accent" : "primary"} 
            onClick={() => setProperties({ activeCriteria: "week"} )}
          >Week
          </Button>
          <Button
            css={{marginRight: "0.5em"}}
            variant={activeCriteria === "month" ? "accent" : "primary"}
            onClick={() => setProperties({ activeCriteria: "month"} )}
          >Month
          </Button>
          <Button
            variant={activeCriteria === "interval" ? "accent" : "primary"}
            onClick={() => setProperties({ activeCriteria: "interval"} )}
          >Interval
          </Button>
        </nav>
      </header>
      <div
        className={bem("tiles", {
          "week": activeCriteria === "week",
          "month": activeCriteria === "month",
          "interval": activeCriteria === "interval"
        })}
      >{activeCriteria === "week" ?
        <WeekOption daysOfWeek={routine.properties.daysOfWeek} setProperties={setProperties} />
        : activeCriteria === "month" ?
        <MonthOption daysOfMonth={routine.properties.daysOfMonth} setProperties={setProperties} />
        :
        <IntervalOption
          intervalDays={routine.properties.intervalDays}
          intervalStart={routine.properties.intervalStart}
          setProperties={setProperties}
        />
      }</div>
    </div>
  )
}
