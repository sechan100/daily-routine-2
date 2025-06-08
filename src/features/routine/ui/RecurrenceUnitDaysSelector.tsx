import { RecurrenceUnit } from "@/entities/routine";
import { DayOfWeek } from "@/shared/period/day";
import { MonthUnitControl } from "./MonthUnitControl";
import { WeekUnitControl } from "./WeekUnitControl";



type Props = {
  recurrenceUnit: RecurrenceUnit;
  daysOfWeek: DayOfWeek[];
  onDaysOfWeekChange: (days: DayOfWeek[]) => void;
  daysOfMonth: number[];
  onDaysOfMonthChange: (days: number[]) => void;
}
export const RecurrenceUnitDaysSelector = ({
  recurrenceUnit,
  daysOfWeek,
  onDaysOfWeekChange,
  daysOfMonth,
  onDaysOfMonthChange,
}: Props) => {

  return (
    <>
      <div>
        {recurrenceUnit === "week" ?
          <WeekUnitControl
            daysOfWeek={daysOfWeek}
            onDaysOfWeekChange={onDaysOfWeekChange}
          />
          :
          <MonthUnitControl
            daysOfMonth={daysOfMonth}
            onDaysOfMonthChange={onDaysOfMonthChange}
          />
        }
      </div>
    </>
  )
}