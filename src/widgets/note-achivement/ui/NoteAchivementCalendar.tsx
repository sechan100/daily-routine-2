/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository, RoutineNote } from '@entities/note';
import { Day } from "@shared/period/day";
import { BaseCalendar } from '@shared/components/BaseCalendar';
import { useCallback, useEffect, useState } from "react";
import { useTabRoute } from '@shared/tab/use-tab-route';
import { Month } from '@shared/period/month';
import { PerformanceCircle } from '@features/performance';
import { SwipeableCalendar } from '@shared/components/swipeable-calender/SwipeableCalendar';
import { useAsync } from '@shared/utils/use-async';
import { useTabHeight } from '@app/ui/use-tab-height';



export interface NoteAchivementCalendarProps {
  month: Month;
}
export const NoteAchivementCalendar = ({ month }: NoteAchivementCalendarProps) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const route = useTabRoute(s=>s.route);
  const tabHeight = useTabHeight();


  const tile = useCallback((tileDay: Day) => {
    let performance = NoteEntity.getEmptyNotePerformance();
    if(notesAsync.value){
      const note = notesAsync.value.find(note => note.day.isSameDay(tileDay));
      if(note){
        performance = NoteEntity.getPerformance(note);
      }
    }
    return (
      <PerformanceCircle performance={performance} text={tileDay.date.toString()} />
    )
  }, [notesAsync.value]);

  const onTileClick = useCallback((day: Day) => {
    route("note", { day });
  }, [route]);


  if(notesAsync.loading) return <div>Loading...</div>;
  return (
    <SwipeableCalendar
      month={month}
      onTileClick={onTileClick}
      tile={tile}
      verticalHeight={tabHeight}
      stylesOption={{
        tile: {
          border: "0",
        }
      }}
    />
  )
}