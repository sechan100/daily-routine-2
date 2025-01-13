/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { SwipeableCalendar } from "@shared/components/swipeable-calender/SwipeableCalendar";
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