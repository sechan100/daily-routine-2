import { RoutineCalendar as RoutineCalendarFeature } from "@features/calendar"
import { Day } from "@shared/day";









export interface AchivementPageProps {
  day: Day;
}
export const AchivementPage = ({ day }: AchivementPageProps) => {

  return (
    <>
      <RoutineCalendarFeature day={day} />
    </>
  )
}