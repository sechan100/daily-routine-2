import { RoutineCalendar as RoutineCalendarFeature } from "@features/calendar"
import { Day } from "@shared/day";









export interface RoutineCalendarProps {
  defaultDay?: Day; // 초기값 날짜
  onDayTileClick?: (day: Day) => void; // 날짜타일 클릭시 콜백
}
export const RoutineCalendar = (props: RoutineCalendarProps) => {

  return (
    <>
      <RoutineCalendarFeature {...props} />
    </>
  )
}