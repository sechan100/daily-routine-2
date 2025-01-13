/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository, Task } from "@entities/note";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/utils/use-async";
import { useCallback, useMemo } from "react";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { PerformanceCircle } from "@features/performance";
import { Badge } from "@mui/material";


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const route = useTabRoute(s=>s.route);

  const tile = useCallback((day: Day) => {
    if(day.month !== month.monthNum) return <></>;
    let performance = NoteEntity.getEmptyNotePerformance();
    if(notesAsync.value){
      const note = notesAsync.value.find(note => note.day.isSameDay(day));
      if(note){
        performance = NoteEntity.getPerformance(note);
      }
    }
    return (
      <div css={{
        width: "100%",
        height: "100%",
      }}>
        <Badge badgeContent="Tdy" color="primary" overlap="circular" invisible={!day.isToday()} css={{
          "& > .MuiBadge-badge": {
            padding: "2px 5px",
            height: "fit-content",
            backgroundColor: "var(--color-accent)",
            clipPath: "inset(-50px)"
          }
        }}>
          <PerformanceCircle performance={performance} text={day.date.toString()} />
        </Badge>
      </div>
    )
  }, [month.monthNum, notesAsync.value]);
  

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
          border: "0",
          overflow: "visible !important",
        }
      }}
    />
  );
};
