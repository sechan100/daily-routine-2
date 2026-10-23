/** @jsxImportSource @emotion/react */
import { Month } from "@shared/period/month";
import { SwipeableCalendar } from "@shared/components/swipeable-calendar/SwipeableCalendar";
import { useTabHeight } from "@app/ui/use-tab-height";
import { CalendarSlide } from "./CalendarSlide";


type Props = {
  month: Month;
}
export const CalendarWidget = ({ month }: Props) => {
  const tabHeight = useTabHeight();
  
  return (
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
  )

}
