/** @jsxImportSource @emotion/react */
import { DailyRoutineBEM } from "@shared/daily-routine-bem"





interface TaskNameProps {
  name: string;
  bem: DailyRoutineBEM;
}
export const TaskName = ({ name, bem }: TaskNameProps) => {
  return (
    <span 
      className={bem("name")}
      css={{
        position: "relative",
        cursor: "pointer",
        transition: "color 0.3s ease",
        "&:after": {
          content: "''",
          position: "absolute",
          top: "50%",
          left: 0,
          width: 0,
          height: "1px",
          background: "#9098a9",
        },
        ".dr-task--checked &": {
          color: "#9098a9",
          "&:after": {
            width: "100%",
            transition: "all 0.4s ease",
          }
        }
      }}
    >
      {name}
    </span>
  )
}