/** @jsxImportSource @emotion/react */
import { Month } from '@shared/period/month';
import { SwipeableCalendar } from '@shared/components/swipeable-calender/SwipeableCalendar';
import { CalendarSlide } from './CalendarSlide';
import { TEXT_CSS } from '@shared/components/text-style';



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
  
  return (
    <div css={{
      position: "relative",
    }}>
      <SwipeableCalendar
        month={month}
        verticalHeight={height}
        maxWidth={maxWidth}
      >
        {month => <CalendarSlide month={month} routineName={routineName} />}
      </SwipeableCalendar>
      <div css={{
        position: "absolute",
        top: height,
        transform: "translateY(100%)",
        marginTop: "1em",
        left: 0,
        zIndex: 1000,
        borderTop: "1px solid var(--color-base-30)",
        width: "100%",
      }}>
        <div css={[TEXT_CSS.medium, {
          padding: "1em 1em",
        }]}>{routineName}</div>
      </div>
    </div>
  )
}