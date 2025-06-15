/** @jsxImportSource @emotion/react */
import { NoteProgressCircle } from "@/components/note/NoteProgressCircle";
import { getNoteProgress } from "@/domain/note/get-note-progress";
import { noteRepository } from "@/entities/repository/note-repository";
import { ZERO_NOTE_PROGRESS } from "@/entities/types/progress";
import { BaseCalendar } from "@/shared/components/calendar-legacy/BaseCalendar";
import { Day } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { useRouter } from "@/shared/route/use-router";
import { useAsync } from "@/shared/utils/use-async";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { Badge } from "@mui/material";
import { useCallback } from "react";


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const notesAsync = useAsync(async () => await noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const { route } = useRouter();

  const tile = useCallback((day: Day) => {
    if (day.month !== month.monthNum) return <></>;
    let progress = ZERO_NOTE_PROGRESS;
    if (notesAsync.value) {
      const note = notesAsync.value.find(note => note.day.isSameDay(day));
      if (note) {
        progress = getNoteProgress(note);
      }
    }
    return (
      <div css={{
        width: "100%",
        height: "100%",
      }}>
        <Badge badgeContent="T" color="primary" overlap="circular" invisible={!day.isToday()} css={{
          "& > .MuiBadge-badge": {
            padding: "2px 5px",
            height: "fit-content",
            backgroundColor: "var(--color-accent)",
            clipPath: "inset(-50px)"
          }
        }}>
          <NoteProgressCircle progress={progress} text={day.date.toString()} />
        </Badge>
      </div>
    )
  }, [month.monthNum, notesAsync.value]);


  const onTileClick = useCallback((day: Day) => {
    useNoteDayStore.getState().setDay(day);
    route("note");
  }, [route]);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);


  if (notesAsync.loading) return <div>Loading...</div>;
  return (
    <BaseCalendar
      month={month}
      setMonth={() => { }}
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
