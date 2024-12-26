/** @jsxImportSource @emotion/react */
import { Day } from "@shared/period/day";
import { Tile } from "../model/types"
import { TEXT_CSS } from "@shared/components/text-style";
import { Task } from "@entities/note";
import { css } from "@emotion/react";
import { useContext } from "react";
import { useTileHeightInfo } from "./tile-height-info-context";


const defaultTextStyle = css({
  lineHeight: '9px',
  fontSize: '9px',
})


const DateBadge = ({ day }: { day: Day }) => {
  return (
    <div css={[{
      position: 'relative',
      textAlign: 'start',
      padding: '0 0 0 3px',
      // padding: day.isToday() ? '1px 0 0 1px ' : '0 0 0 3px',
    }, TEXT_CSS.description]}>
      <span css={{
        display: 'inline-block',
        width: '15px',
        height: '15px',
        lineHeight: '15px',
        borderRadius: '50%',
        textAlign: 'start',
        backgroundColor: 'transparent',
        // textAlign: day.isToday() ? 'center' : 'start',
        // backgroundColor: day.isToday() ? 'var(--color-accent)' : 'transparent',
      }}>
        {day.date}
      </span>
    </div>
  )
}





const TaskLineContainer = ({ tasks }: { tasks: Task[] }) => {
  const { limitedTaskPer } = useTileHeightInfo();
  if(tasks.length <= limitedTaskPer){
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
    <div className="dr-calendar-tasks">
      {tasks.slice(0, limitedTaskPer - 1).map(task => (
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
          + {tasks.length - (limitedTaskPer - 1)}
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
      backgroundColor: 'var(--color-accent-1)',
      borderRadius: '2px',
      textAlign: 'start',
      textOverflow: 'ellipsis',
      overflow: "hidden",
      whiteSpace: "nowrap",
    }]}>
      {task.name}
    </div>
  )
}


type Props = {
  tile: Tile;
}
export const CalendarTile = ({ tile }: Props) => {
  const { tileHeight } = useTileHeightInfo();
  
  return (
    <div css={{
      height: tileHeight,
      width: '100%',
      ...(tile.day.isToday() && {
        background: "hsla(var(--color-accent-2-hsl), 0.5)",
      }),
    }}>
      <DateBadge day={tile.day} />
      <TaskLineContainer tasks={tile.tasks} />
    </div>
  )
}