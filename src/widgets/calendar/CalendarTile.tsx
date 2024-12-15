/** @jsxImportSource @emotion/react */
import { Day } from "@shared/period/day";
import { Tile } from "./model/types"
import { TEXT_CSS } from "@shared/constants/text-style";
import { Task } from "@entities/note";
import { css } from "@emotion/react";


const defaultTextStyle = css({
  lineHeight: '9px',
  fontSize: '9px',
})


const DateBadge = ({ day }: { day: Day }) => {
  return (
    <div css={[{
      position: 'relative',
      textAlign: 'start',
      padding: day.isToday() ? '1px 0 0 1px ' : '0 0 0 3px',
    }, TEXT_CSS.description]}>
      <span css={[{
        display: 'inline-block',
        width: '15px',
        height: '15px',
        lineHeight: '15px',
        borderRadius: '50%',
        textAlign: day.isToday() ? 'center' : 'start',
        backgroundColor: day.isToday() ? 'var(--color-accent)' : 'transparent',
      }, (day.isToday() && TEXT_CSS.onAccent)]}>
        {day.date}
      </span>
    </div>
  )
}


const TaskLineContainer = ({ tasks }: { tasks: Task[] }) => {
  if(tasks.length <= 4){
    return (
      <div>
        {tasks.map(task => (
          <TaskLine 
            key={task.name}
            task={task}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      {tasks.slice(0, 3).map(task => (
        <TaskLine 
          key={task.name}
          task={task}
        />
      ))}
      <div css={[defaultTextStyle, {
        margin: '1px 1px',
        padding: '2px 0 2px 2px',
        textAlign: 'center',
      }]}>
        <span>
          + {tasks.length - 3}
        </span>
      </div>
    </div>
  )
}

const TaskLine = ({ task }: { task: Task }) => {
  return (
    <div css={[TEXT_CSS.onAccent, defaultTextStyle, {
      margin: '1px 1px',
      padding: '2px 0 2px 2px',
      backgroundColor: 'var(--color-accent)',
      borderRadius: '2px',
      textAlign: 'start',
    }]}>
      <span>
        {task.name}
      </span>
    </div>
  )
}


interface CalendarTileProps {
  tile: Tile;
}
export const CalendarTile = ({ tile }: CalendarTileProps) => {

  
  return (
    <div css={{
      height: '77px',
      width: '100%',
    }}>
      <DateBadge day={tile.day} />
      <TaskLineContainer tasks={tile.tasks} />
    </div>
  )
}