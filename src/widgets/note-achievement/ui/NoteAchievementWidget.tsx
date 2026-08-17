/** @jsxImportSource @emotion/react */
import { SwipeableCalendar } from '@shared/components/swipeable-calendar/SwipeableCalendar';
import { Month } from '@shared/period/month';
import { CalendarSlide } from './CalendarSlide';



export interface NoteAchievementCalendarProps {
  month: Month;
  height: number;
  maxWidth: number;
}
export const NoteAchievementWidget = ({ month, height, maxWidth }: NoteAchievementCalendarProps) => {

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