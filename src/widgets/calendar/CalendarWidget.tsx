import { BaseCalendar } from "@shared/components/BaseCalendar"
import { Day } from "@shared/day"
import { useCallback, useState } from "react";
import { CalendarTile } from "./CalendarTile";




interface DrCalendarProps {
  day: Day;
}
export const CalendarWidget = ({ day: propsDay }: DrCalendarProps) => {
  const [day, setDay] = useState(propsDay)

  const tile = useCallback((day: Day) => {
    return <CalendarTile day={day} />
  }, [])
  
  return (
    <BaseCalendar
      day={day}
      setDay={setDay}
      tile={tile}
    />
  )
}