import { BaseCalendar } from "@shared/components/BaseCalendar"
import { Day } from "@shared/period/day"
import { useCallback, useState } from "react";
import { CalendarTile } from "./CalendarTile";
import { Month } from "@shared/period/month";




interface CalendarWidgetProps {
  month: Month;
}
export const CalendarWidget = ({ month: propsMonth }: CalendarWidgetProps) => {
  const [month, setMonth] = useState(propsMonth);

  const tile = useCallback((day: Day) => {
    return <CalendarTile day={day} />
  }, [])
  
  return (
    <BaseCalendar
      month={month}
      setMonth={setMonth}
      tile={tile}
    />
  )
}