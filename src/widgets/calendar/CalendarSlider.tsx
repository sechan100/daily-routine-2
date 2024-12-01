import { Task } from "@entities/note";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/use-async";
import { useCallback, useMemo } from "react";
import { CalendarTile } from "./CalendarTile";
import { loadCalendar } from "./model/load-calendar";
import { Tile } from "./model/types";


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const calendarAsync = useAsync(async () => await loadCalendar(month), [month]);

  const tiles = useMemo<Map<string, Tile>>(() => {
    if(calendarAsync.value) {
      return calendarAsync.value.tiles;
    } else {
      return new Map();
    }
  }, [calendarAsync.value]);


  const tile = useCallback((day: Day) => {
    let tile = {
      day,
      tasks: [] as Task[]
    };
    tile = tiles.get(day.format()) || tile;
    return <CalendarTile tile={tile} />;
  }, [tiles]);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);


  if (calendarAsync.loading) return <div>Loading...</div>;
  return (
    <BaseCalendar
      month={month}
      setMonth={() => {}}
      tile={tile}
      showNavigation={false}
      tileDisabled={tileDisabled}
    />
  );
};
