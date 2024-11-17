import { DrCalendar } from "@features/calendar";
import { Day } from "@shared/day";









export interface CalendarPageProps {
  day: Day;
}
export const CalendarPage = ({ day }: CalendarPageProps) => {

  return (
    <>
      <DrCalendar day={day} />
    </>
  )
}