import { CalendarWidget } from "@widgets/calendar";
import { Day } from "@shared/day";









export interface CalendarPageProps {
  day: Day;
}
export const CalendarPage = ({ day }: CalendarPageProps) => {

  return (
    <>
      <CalendarWidget day={day} />
    </>
  )
}