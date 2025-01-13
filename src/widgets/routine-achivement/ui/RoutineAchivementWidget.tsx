/** @jsxImportSource @emotion/react */
import { Month } from '@shared/period/month';
import { SwipeableCalendar } from '@shared/components/swipeable-calender/SwipeableCalendar';
import { CalendarSlide } from './CalendarSlide';
import { TEXT_CSS } from '@shared/components/text-style';
import { useLeaf } from '@shared/view/use-leaf';



export interface Props {
  month: Month;
  routineName: string;
  height: number;
  maxWidth: number;
}
export const RoutineAchivementWidget = ({ 
  month,
  height,
  routineName,
  maxWidth
}: Props) => {
    const { view, leafBgColor } = useLeaf();
  
  return (
    <div>
      <div css={[TEXT_CSS.medium, {
        padding: "1em 1em",
      }]}>
        {routineName}
      </div>
      <SwipeableCalendar
        month={month}
        verticalHeight={height}
        maxWidth={maxWidth}
      >
        {month => <CalendarSlide month={month} routineName={routineName} />}
      </SwipeableCalendar>
      <div>
        세차니
      </div>
    </div>
  )
}