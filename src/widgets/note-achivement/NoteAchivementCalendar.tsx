/** @jsxImportSource @emotion/react */
import { NoteRepository, RoutineNote, NoteService } from '@entities/note';
import { Day } from "@shared/day";
import { PercentageCircle } from "@shared/components/PercentageCircle";
import { BaseCalendar } from '@shared/components/BaseCalendar';
import { useCallback, useEffect, useState } from "react";
import { useTabRoute } from '@shared/use-tab-route';



export interface NoteAchivementCalendarProps {
  day: Day;
}
export const NoteAchivementCalendar = ({ day: propsDay }: NoteAchivementCalendarProps) => {
  const [day, setDay] = useState<Day>(propsDay);
  const { route } = useTabRoute();
  const [routineNotes, setRoutineNotes] = useState<RoutineNote[] | null>(null);


  // 해당 월의 루틴 노트들을 가져온다.
  useEffect(() => {
    const start = new Day(day.moment.startOf("month"));
    const end = new Day(day.moment.endOf("month"));
    NoteRepository.loadBetween(start, end)
    .then(notes => {
      setRoutineNotes(notes)
    });
  }, [day]);


  const tile = useCallback((tileDay: Day) => {
    let percent = 0;
    if(routineNotes){
      const routineNote = routineNotes.find(note => note.day.isSameDay(tileDay));
      if(routineNote){
        const completion = NoteService.getTaskCompletion(routineNote);
        percent = completion.percentageRounded;
      }
    }
    return (
      <PercentageCircle percentage={percent} text={tileDay.getDate().toString()} />
    )
  }, [routineNotes]);


  return (
    <BaseCalendar
      day={day}
      setDay={setDay}
      tile={tile}
      onTileClick={day => route("note", { day })}
      className='dr-note-achivement-calendar'
    />
  )
}