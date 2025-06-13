/** @jsxImportSource @emotion/react */
import { SwipeableCalendarProvider } from '@/shared/components/calendar-legacy/SwipeableCalendarProvider';
import { Month } from '@/shared/period/month';
import { CalendarSlide } from './CalendarSlide';



export interface NoteAchivementCalendarProps {
  month: Month;
  height: number;
  maxWidth: number;
}
export const NoteAchivementWidget = ({ month, height, maxWidth }: NoteAchivementCalendarProps) => {

  return (
    <SwipeableCalendarProvider
      month={month}
      verticalHeight={height}
      maxWidth={maxWidth}
    >
      {month => <CalendarSlide month={month} />}
    </SwipeableCalendarProvider>
  )
}