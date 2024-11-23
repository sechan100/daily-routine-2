import { Day } from "@shared/period/day"



interface CalendarTileProps {
  day: Day;
}
export const CalendarTile = ({ day }: CalendarTileProps) => {
  
  return (
    <div>
      {day.getDate().toString()}
    </div>
  )
}