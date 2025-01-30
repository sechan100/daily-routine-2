/** @jsxImportSource @emotion/react */
import { SwipeableCalendar } from '@shared/components/swipeable-calender/SwipeableCalendar';
import { Month } from '@shared/period/month';
import { useState } from 'react';
import { CalendarSlide } from './CalendarSlide';
import { RoutineSelector } from './RoutineSelector';



export interface Props {
  month: Month;
  height: number;
  maxWidth: number;
}
export const RoutineAchivementWidget = ({ 
  month: propsMonth,
  height,
  maxWidth
}: Props) => {
  const [month, setMonth] = useState<Month>(propsMonth);
  
  return (
    <>
      <RoutineSelector month={month} maxWidth={maxWidth} />
      <SwipeableCalendar
        month={month}
        verticalHeight={height}
        maxWidth={maxWidth}
        onMonthChange={setMonth}
      >
        {month => <CalendarSlide month={month} />}
      </SwipeableCalendar>
    </>
  )
}