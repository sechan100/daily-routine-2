/** @jsxImportSource @emotion/react */
import { BaseCalendar, CalendarStyleOptions } from "@shared/components/BaseCalendar";
import { Day, DayFormat } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useCallback } from "react";


interface Props {
  month: Month;
  tile: (day: Day) => JSX.Element;
  onTileClick: (day: Day) => void;
  styleOptions?: CalendarStyleOptions;
}
export const CalendarSlide = ({
  month,
  tile,
  onTileClick,
  styleOptions
}: Props) => {

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
      styleOptions={Object.assign({
        tileContainer: {
          gap: "0",
        },
        tile: {
          border: "0.5px solid black",
          borderRadius: "0",
        }
      }, styleOptions)}
    />
  );
};
