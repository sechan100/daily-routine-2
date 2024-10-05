import Calendar from "react-calendar"
import "./calendar-style.css";
import { PerCentageCircle } from "./PercentageCircel";


export const RoutineCalendar = () => {

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    return (
      <PerCentageCircle percentage={Math.random() * 100} text={date.getDate().toString()} />
    )
  }

  return (
    <div>
      <Calendar tileContent={tileContent} />
    </div>
  )
}