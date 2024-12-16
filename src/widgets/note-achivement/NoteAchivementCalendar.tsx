/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository, RoutineNote } from '@entities/note';
import { Day } from "@shared/period/day";
import { PercentageCircle } from "@shared/components/PercentageCircle";
import { BaseCalendar } from '@shared/components/BaseCalendar';
import { useCallback, useEffect, useState } from "react";
import { useTabRoute } from '@shared/use-tab-route';
import { Month } from '@shared/period/month';



export interface NoteAchivementCalendarProps {
  month: Month;
}
export const NoteAchivementCalendar = ({ month: propsMonth }: NoteAchivementCalendarProps) => {
  const [month, setMonth] = useState<Month>(propsMonth);
  const { route } = useTabRoute();
  const [notes, setNotes] = useState<RoutineNote[] | null>(null);


  // 해당 월의 루틴 노트들을 가져온다.
  useEffect(() => {
    noteRepository
    .loadBetween(month.startDay, month.endDay)
    .then(notes => {
      setNotes(notes)
    });
  }, [month]);


  const tile = useCallback((tileDay: Day) => {
    let percent = 0;
    if(notes){
      const note = notes.find(note => note.day.isSameDay(tileDay));
      if(note){
        const completion = NoteEntity.getCompletion(note);
        percent = completion.percentageRounded;
      }
    }
    return (
      <PercentageCircle percentage={percent} text={tileDay.date.toString()} />
    )
  }, [notes]);


  return (
    <BaseCalendar
      month={month}
      setMonth={setMonth}
      tile={tile}
      onTileClick={day => route("note", { day })}
      className='dr-note-achivement-calendar'
    />
  )
}