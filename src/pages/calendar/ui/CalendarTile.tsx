/** @jsxImportSource @emotion/react */
import { Task } from "@/entities/note";
import { TEXT_CSS } from "@/shared/components/text-style";
import { Day, DayOfWeek } from "@/shared/period/day";
import { css } from "@emotion/react";
import { Tile } from "../model/types";
import { useTileConfig } from "./tile-config-context";


const defaultTextStyle = css({
  lineHeight: '9px',
  fontSize: '9px',
})


const DateBadge = ({ day }: { day: Day }) => {
  const isWeekend = day.isSameDow(DayOfWeek.SAT) || day.isSameDow(DayOfWeek.SUN);
  const isToday = day.isToday();

  return (
    <div css={[{
      position: 'relative',
      width: "100%",
      margin: '1px 0',
    }, TEXT_CSS.description]}>
      <span css={{
        display: 'inline-block',
        position: 'relative',
        width: '15px',
        height: '15px',
        lineHeight: '15px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: isToday ? "var(--text-on-accent)" : isWeekend ? 'var(--color-accent-1)' : "var(--text-color)",
        zIndex: 2,

        "&::after": isToday && {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent-1)',
          zIndex: -10,
        },
      }}>
        {day.date}
      </span>
    </div>
  )
}


const TaskLineContainer = ({ tasks }: { tasks: Task[] }) => {
  const { limitedTaskPer } = useTileConfig();


  const taskListStyle = css({
    width: '100%',
    "li:nth-child(1)": firstTaskLineStyle,
    "li:last-child": lastTaskLineStyle,
  });

  if (tasks.length <= limitedTaskPer) {
    return (
      <div className="dr-calendar-tasks" css={taskListStyle}>
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
    <>
      <div className="dr-calendar-tasks" css={taskListStyle}>
        {tasks.slice(0, limitedTaskPer - 1).map(task => (
          <TaskLine
            key={task.name}
            task={task}
          />
        ))}
      </div>
      <div css={[defaultTextStyle, {
        padding: '2px 0 2px 2px',
        textAlign: 'center',
      }]}>
        <span>
          + {tasks.length - (limitedTaskPer - 1)}
        </span>
      </div>
    </>
  )
}


const taskLineBorderStyle = "1px solid var(--color-base-60)";

const firstTaskLineStyle = css({
});

const lastTaskLineStyle = css({
  borderBottom: taskLineBorderStyle
});

const TaskLine = ({ task }: { task: Task }) => {
  return (
    <li css={[defaultTextStyle, {
      margin: '0px',
      padding: '2px 0 2px 2px',
      // backgroundColor: 'var(--color-accent-1)',
      textAlign: 'start',
      textOverflow: 'ellipsis',
      whiteSpace: "nowrap",
      borderTop: taskLineBorderStyle,
    }]}>
      {task.name}
    </li>
  )
}


type Props = {
  tile: Tile;
}
export const CalendarTile = ({ tile }: Props) => {
  const { tileHeight } = useTileConfig();

  return (
    <div css={{
      height: tileHeight,
      width: '100%',
    }}>
      <DateBadge day={tile.day} />
      <TaskLineContainer tasks={tile.tasks} />
    </div>
  )
}