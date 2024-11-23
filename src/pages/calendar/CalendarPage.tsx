import { Month } from "@shared/period/month";
import { CalendarWidget } from "@widgets/calendar";









export interface CalendarPageProps {
  month: Month;
}
export const CalendarPage = ({ month }: CalendarPageProps) => {

  return (
    <>
      <CalendarWidget month={month} />
    </>
  )
}