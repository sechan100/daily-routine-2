/** @jsxImportSource @emotion/react */

import { noteRepository } from "@entities/note";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/utils/use-async";
import { useCallback } from "react";
import { CalendarTile } from "./CalendarTile";
import { Tile } from "../model/types";
import { resolveRoutineTiles } from "../model/resolve-routine-tiles";


interface Props {
  month: Month;
  routineName: string;
}
export const CalendarSlide = ({ routineName, month }: Props) => {
  const tilesAsync = useAsync(async () => await resolveRoutineTiles(routineName, month), [month]);

  const tile = useCallback((day: Day) => {
    if(day.month !== month.monthNum) return <></>;
    const tile = tilesAsync.value?.get(day.format());
    if(!tile) throw new Error(`tile not found for ${day.format()}`);
    return <CalendarTile tile={tile} />;
  }, [month.monthNum, tilesAsync.value]);

  const onTileClick = useCallback((day: Day) => {
    console.log(day);
  }, []);

  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);

    
  if(tilesAsync.loading) return <div>Loading...</div>;
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
