/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { useCallback, useMemo, useState } from "react";
import { useLeaf } from "@shared/view/use-leaf";
import { SwipeableCalendar } from "@shared/components/swipeable-calender/SwipeableCalendar";
import { useAsync } from "@shared/utils/use-async";
import { loadTileMap } from "../model/load-tile-map";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { Day } from "@shared/period/day";
import { CalendarTile } from "./CalendarTile";
import { Task } from "@entities/note";
import { useTabHeight } from "@app/ui/use-tab-height";
import { TileHeightInfoProvider } from "./tile-height-info-context";
import { CalendarSlide } from "./CalendarSlide";


type Props = {
  month: Month;
}
export const CalendarWidget = ({ month }: Props) => {
  const tabHeight = useTabHeight();
  
  return (
    <TileHeightInfoProvider>
      <SwipeableCalendar
        month={month}
        verticalHeight={tabHeight}
      >
        {month => (
          <CalendarSlide
            month={month} 
          />
        )}
      </SwipeableCalendar>
    </TileHeightInfoProvider>
  )

}