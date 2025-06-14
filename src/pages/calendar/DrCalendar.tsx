import { SwipeableCalendarProvider } from "@/shared/components/calendar-legacy/SwipeableCalendarProvider";
import { useTabHeight } from "@/shared/use-tab-height";
import { useCalendarMonthStore } from "@/stores/client/use-calendar-month-store";
import { CalendarSlide } from "./CalendarSlide";
import { TileConfigProvider } from "./tile-config-context";




export const DrCalendar = () => {
  const month = useCalendarMonthStore(s => s.month);
  const tabHeight = useTabHeight();

  return (
    <TileConfigProvider>
      <SwipeableCalendarProvider
        month={month}
        verticalHeight={tabHeight}
      >
        {m => <CalendarSlide month={m} />}
      </SwipeableCalendarProvider>
    </TileConfigProvider>
  )
}