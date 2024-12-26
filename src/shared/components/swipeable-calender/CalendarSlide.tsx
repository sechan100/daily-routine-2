/** @jsxImportSource @emotion/react */
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { Day, DayFormat } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useCallback } from "react";


interface Props<T> {
  month: Month;
  tile: (day: Day) => JSX.Element;
  onTileClick: (day: Day) => void;
}
export const CalendarSlide = <T,>({
  month,
  tile,
  onTileClick,
}: Props<T>) => {

  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);

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
          border: "0.5px solid black",
          borderRadius: "0",
        }
      }}
    />
  );
};
