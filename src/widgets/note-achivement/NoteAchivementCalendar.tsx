/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository, RoutineNote } from '@entities/note';
import { Day } from "@shared/period/day";
import { BaseCalendar } from '@shared/components/BaseCalendar';
import { useCallback, useEffect, useState } from "react";
import { useTabRoute } from '@shared/tab/use-tab-route';
import { Month } from '@shared/period/month';
import { PerformanceCircle } from '@features/performance';



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
    let performance = NoteEntity.getEmptyNotePerformance();
    if(notes){
      const note = notes.find(note => note.day.isSameDay(tileDay));
      if(note){
        performance = NoteEntity.getPerformance(note);
      }
    }
    return (
      <PerformanceCircle performance={performance} text={tileDay.date.toString()} />
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