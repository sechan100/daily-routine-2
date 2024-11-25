import { Tile } from "./model/types"



interface CalendarTileProps {
  tile: Tile;
}
export const CalendarTile = ({ tile }: CalendarTileProps) => {

  
  return (
    <div>
      {tile.day.getDate()}일
      {tile.tasks.map(task => (
        <div key={task.name}>
          {task.name}
        </div>
      ))}
    </div>
  )
}