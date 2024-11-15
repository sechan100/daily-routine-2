import { routineNoteArchiver, RoutineNote, routineNoteService } from '@entities/note';
import { Day } from "@shared/day";
import { PercentageCircle } from "@shared/components/PercentageCircle";
import Calendar from "react-calendar"
import { moment } from "obsidian";
import { useCallback, useEffect, useState } from "react";
import { OnArgs } from "react-calendar/dist/cjs/shared/types";
import "./calendar-style.scss";
import { useTabRoute } from '@shared/use-tab-route';


export interface RoutineCalendarProps {
  day: Day;
}
export const RoutineCalendar = ({ day: propsDay }: RoutineCalendarProps) => {
  const [activeDay, setActiveDay] = useState<Day>(propsDay);
  const { route } = useTabRoute();


  /////////////////////////////////////
  // 해당 달의 모든 루틴 노트들을 가져와서 상태로 저장
  const [routineNotes, setRoutineNotes] = useState<RoutineNote[] | null>(null);
  // 해당 월의 루틴 노트들을 가져온다.
  useEffect(() => {
    const start = new Day(activeDay.moment.startOf("month"));
    const end = new Day(activeDay.moment.endOf("month"));
    routineNoteArchiver.loadBetween(start, end)
    .then(notes => {
      setRoutineNotes(notes)
    });
  }, [activeDay]);


  // 월이 바뀔 때
  const onActiveStartDateChange = ({ action, activeStartDate, value, view }: OnArgs) => {
    if(activeStartDate) setActiveDay(new Day(moment(activeStartDate)));
  }

  const onClickDay = useCallback((v: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    const day = new Day(moment(v));
    route("note", { day });
  }, [route]);


  // 달력의 날짜 타일 하나하나를 렌더링하는 방식을 정의
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

  if(!routineNotes) return <div>Loading...</div>;
  return (
    <div className="dr-routine-note-calendar">
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
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const cancel = setTimeout(() => {
      setPercent(percentage);
    }, 0);
    return () => clearTimeout(cancel);
  }, [percentage]);

  return (
    <PercentageCircle percentage={percent} text={day.getDate().toString()} />
  )
}