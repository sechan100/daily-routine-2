import { SwipeableCalendar } from "@/shared/components/swipeable-calender/SwipeableCalendar";
import { Month } from "@/shared/period/month";
import { useTabHeight } from "@/shared/use-tab-height";
import { CalendarSlide } from "./CalendarSlide";
import { TileConfigProvider } from "./tile-config-context";




export interface CalendarPageProps {
  month: Month;
}
export const TaskCalendar = ({ month }: CalendarPageProps) => {
  const tabHeight = useTabHeight();

  return (
    <TileConfigProvider>
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
    </TileConfigProvider>
  )
}