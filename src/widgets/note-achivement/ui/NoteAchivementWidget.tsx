/** @jsxImportSource @emotion/react */
import { SwipeableCalendar } from '@shared/components/swipeable-calender/SwipeableCalendar';
import { Month } from '@shared/period/month';
import { CalendarSlide } from './CalendarSlide';



export interface NoteAchivementCalendarProps {
  month: Month;
  height: number;
  maxWidth: number;
}
export const NoteAchivementWidget = ({ month, height, maxWidth }: NoteAchivementCalendarProps) => {

  return (
    <SwipeableCalendar
      month={month}
      verticalHeight={height}
      maxWidth={maxWidth}
    >
      {month => <CalendarSlide month={month}/>}
    </SwipeableCalendar>
  )
}