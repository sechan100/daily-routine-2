import { BaseCalendar } from "@shared/components/BaseCalendar"
import { Day } from "@shared/period/day"
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarTile } from "./CalendarTile";
import { Month } from "@shared/period/month";
import { loadCalendar } from "./model/load-calendar";
import { Tile } from "./model/types";
import { useAsync } from "@shared/use-async";
import { Task } from "@entities/note";


interface CalendarWidgetProps {
  month: Month;
}
export const CalendarWidget = ({ month: propsMonth }: CalendarWidgetProps) => {
  const [month, setMonth] = useState(propsMonth);
  
  const tiles = useAsync(async () => {
    const c = await loadCalendar(month);
    return c.tiles;
  }, [month]);

  const tile = useCallback((day: Day) => {
    let tile = {
      day,
      tasks: [] as Task[]
    }
    if(tiles.value && day.month === month.num){
      tile = tiles.value[day.date-1] || tile ;
    }
    return <CalendarTile tile={tile} />
  }, [month, tiles.value]);


  if(tiles.loading) return <div>Loading...</div>
  return (
    <BaseCalendar
      month={month}
      setMonth={setMonth}
      tile={tile}
    />
  )
}