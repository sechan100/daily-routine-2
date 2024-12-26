/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { useCallback, useMemo, useState } from "react";
import { useLeaf } from "@shared/view/use-leaf";
import { SwipeableCalendar } from "@shared/components/swipeable-calender/SwipeableCalendar";
import { useAsync } from "@shared/utils/use-async";
import { loadCalendar } from "../model/load-calendar";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { Day } from "@shared/period/day";
import { CalendarTile } from "./CalendarTile";
import { Task } from "@entities/note";
import { calculateTabHeight } from "@app/ui/calculate-tab-height";


type Props = {
  month: Month;
}
export const CalendarWidget = ({ month }: Props) => {
  // const leafBgColor = useLeaf(s=>s.leafBgColor);
  const calendarAsync = useAsync(async () => await loadCalendar(month), [month]);
  const route = useTabRoute(s=>s.route);
  const view = useLeaf(s=>s.view);
  const tabHeight = useMemo(() => calculateTabHeight(view), [view]);

  const renderTile = useCallback((day: Day) => {
    let tile = {
      day,
      tasks: [] as Task[]
    };
    tile = calendarAsync.value?.tiles.get(day.format()) || tile;
    return <CalendarTile tile={tile} />;
  }, [calendarAsync.value?.tiles]);

  const onTileClick = useCallback((day: Day) => {
    route("note", { day });
  }, [route]);

  
  if(!calendarAsync.value || calendarAsync.loading) return <div>Loading...</div>;
  return (
    <SwipeableCalendar
      month={month}
      onTileClick={onTileClick}
      tile={renderTile}
      verticalHeight={tabHeight}
    />
  )

}