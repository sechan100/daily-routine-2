/** @jsxImportSource @emotion/react */
import { Day, DayOfWeek } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { useCallback } from "react";
import { SwipeableCalendar } from "./swipeable-calendar/SwipeableCalendar";
import { SwipeableCalendarProvider } from "./swipeable-calendar/SwipeableCalendarProvider";



type TileProps = {
  day: Day;
}
const Tile = ({ day }: TileProps) => {
  const isWeekend = day.isSameDow(DayOfWeek.SAT) || day.isSameDow(DayOfWeek.SUN);
  const isToday = day.isToday();

  return (
    <div css={[{
      position: 'relative',
      width: "100%",
      margin: '1px 0',
    }]}>
      <span css={{
        display: 'inline-block',
        position: 'relative',
        width: '15px',
        height: '15px',
        lineHeight: '15px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: isToday ? "var(--text-on-accent)" : isWeekend ? 'var(--color-accent-1)' : "var(--text-color)",
        zIndex: 2,

        "&::after": isToday && {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'block',
          width: '150%',
          height: '150%',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent-1)',
          zIndex: -10,
        },
      }}>
        {day.date}
      </span>
    </div>
  )
}

type CalendarSlideProps = {
  month: Month;
  onTileClick?: (day: Day) => void;
}
const CalendarSlide = ({ month, onTileClick }: CalendarSlideProps) => {

  const tile = useCallback((day: Day) => {
    return <Tile day={day} />;
  }, []);

  const handleTileClick = useCallback((day: Day) => {
    onTileClick && onTileClick(day);
  }, [onTileClick]);

  return (
    <SwipeableCalendar
      month={month}
      onTileClick={handleTileClick}
      renderTile={tile}
      styleOptions={{
        tileBorder: {
          width: 1,
          color: 'var(--color-base-40)',
          style: 'solid',
        },
        hideNeighboringDays: true,
      }}
    />
  );
};




type Props = {
  month: Month;
  tileHeight: number;
  onTileClick?: (day: Day) => void;
}
export const DaySelector = ({
  month,
  tileHeight,
  onTileClick,
}: Props) => {

  return (
    <>
      <SwipeableCalendarProvider
        defaultMonth={month}
        tileHeight={tileHeight}
      >
        {month => (
          <CalendarSlide
            month={month}
            onTileClick={onTileClick}
          />
        )}
      </SwipeableCalendarProvider>
    </>
  )
}