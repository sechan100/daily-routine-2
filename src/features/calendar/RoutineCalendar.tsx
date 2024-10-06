import { routineNoteArchiver } from "entities/archive";
import { RoutineNote, routineNoteService } from "entities/routine-note";
//////////////////////////////
import { Day } from "libs/day";
import { PerCentageCircle } from "./PercentageCircel";
import Calendar from "react-calendar"
import "./calendar-style.scss";
import { moment } from "obsidian";
import { useCallback, useEffect, useState } from "react";
import { OnArgs } from "react-calendar/dist/cjs/shared/types";


interface RoutineCalendarProps {
  defaultDay?: Day; // 초기값 날짜
}
export const RoutineCalendar = ({ defaultDay }: RoutineCalendarProps) => {
  const [activeDay, setActiveDay] = useState<Day>(defaultDay??Day.now());
  const [routineNotes, setRoutineNotes] = useState<RoutineNote[] | null>(null);

  // 해당 월의 루틴 노트들을 가져온다.
  useEffect(() => {
    const start = new Day(activeDay.moment.startOf("month"));
    const end = new Day(activeDay.moment.endOf("month"));
    routineNoteArchiver.loadBetween(start, end)
    .then(notes => {
      setRoutineNotes(notes)
      console.log(notes);
    });
  }, [activeDay]);

  const onActiveStartDateChange = ({ action, activeStartDate, value, view }: OnArgs) => {
    if(activeStartDate) setActiveDay(new Day(moment(activeStartDate)));
  }

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== "month" || !routineNotes) return null;
    const day = new Day(moment(date));

    let percent = 0;
    const routineNote = routineNotes.find(note => note.day.isSameDay(day));
    if(routineNote){
      const completion = routineNoteService.getTaskCompletion(routineNote);
      percent = completion.percentageRounded;
    }
    return (
      <DayTile percentage={percent} day={day} />
    )
  }

  const onClickDay = useCallback((v: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    const day = new Day(moment(v));
  }, []);

  if(!routineNotes) return <div>Loading...</div>;
  return (
    <div>
      <Calendar 
        tileContent={tileContent}
        defaultValue={activeDay.getJsDate()}
        allowPartialRange={false}
        onActiveStartDateChange={onActiveStartDateChange}
        selectRange={false}
        onClickDay={onClickDay} 
      />
    </div>
  )
}


interface DayTileProps {
  percentage: number;
  day: Day;
}
const DayTile = ({percentage, day }: DayTileProps) => {
  const [percent, setPercent] = useState(0.1);
  useEffect(() => {
    const cancel = setTimeout(() => {
      setPercent(percentage);
    }, 0);
    return () => clearTimeout(cancel);
  }, [percentage]);
  return (
    <PerCentageCircle percentage={percent} text={day.getDate().toString()} />
  )
}