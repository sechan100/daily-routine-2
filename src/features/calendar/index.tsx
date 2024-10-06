import Calendar from "react-calendar"
import "./calendar-style.scss";
import { PerCentageCircle } from "./PercentageCircel";
import { Day } from "libs/day";
import { moment } from "obsidian";


export const RoutineCalendar = () => {

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== "month") return null;
    const day = new Day(moment(date));
    return (
      <PerCentageCircle percentage={Math.random() * 100} text={day.getDate().toString()} />
    )
  }

  return (
    <div>
      <Calendar tileContent={tileContent} onClickDay={(v, e) => console.log(e.target)}/>
    </div>
  )
}