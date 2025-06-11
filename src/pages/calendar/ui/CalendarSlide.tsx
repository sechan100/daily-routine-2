/** @jsxImportSource @emotion/react */
import { useNoteDayStore } from "@/entities/note";
import { BaseCalendar } from "@/shared/components/BaseCalendar";
import { Day } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { useRouter } from "@/shared/route/use-router";
import { useAsync } from "@/shared/utils/use-async";
import { useCallback, useMemo } from "react";
import { Tile } from "../model/calendar";
import { loadCalendar } from "../model/load-calendar";
import { CalendarTile } from "./CalendarTile";


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const calendarAsync = useAsync(async () => await loadCalendar(month), [month]);
  const { route } = useRouter();

  const tiles = useMemo<Map<string, Tile>>(() => {
    if (calendarAsync.value) {
      return calendarAsync.value.tiles;
    } else {
      return new Map();
    }
  }, [calendarAsync.value]);


  const tile = useCallback((day: Day) => {
    let tile: Tile = {
      day,
      checkables: [],
    };
    tile = tiles.get(day.format()) || tile;
    return <CalendarTile tile={tile} />;
  }, [tiles]);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);

  const onTileClick = useCallback((day: Day) => {
    useNoteDayStore.getState().setDay(day);
    route("note");
  }, [route]);


  if (calendarAsync.loading) return <div>Loading...</div>;
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
          border: "0.5px solid black",
          borderRadius: "0",
        }
      }}
    />
  );
};
