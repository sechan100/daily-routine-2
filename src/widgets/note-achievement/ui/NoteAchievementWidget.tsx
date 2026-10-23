/** @jsxImportSource @emotion/react */
import { SwipeableCalendar } from '@shared/components/swipeable-calendar/SwipeableCalendar';
import { Month } from '@shared/period/month';
import { CalendarSlide } from './CalendarSlide';



export interface NoteAchievementCalendarProps {
  month: Month;
  // 월 네비게이션을 제외하고 위젯이 쓸 수 있는 높이(px)
  height: number;
}
export const NoteAchievementWidget = ({ month, height }: NoteAchievementCalendarProps) => {

  return (
    <SwipeableCalendar
      month={month}
      verticalHeight={height}
    >
      {month => <CalendarSlide month={month}/>}
    </SwipeableCalendar>
  )
}
