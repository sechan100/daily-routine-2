/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository, Task } from "@entities/note";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/utils/use-async";
import { useCallback, useMemo } from "react";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { PerformanceCircle } from "@features/performance";


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const route = useTabRoute(s=>s.route);

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

  
  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);

    
  if(notesAsync.loading) return <div>Loading...</div>;
  return (
    <BaseCalendar
      month={month}
      setMonth={() => {}}
      onTileClick={onTileClick}
      tile={tile}
      showNavigation={false}
      tileDisabled={tileDisabled}
      styleOptions={{
        tileContainer: {
          gap: "0",
        },
        tile: {
          border: "0"
        }
      }}
    />
  );
};
