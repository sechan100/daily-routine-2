/** @jsxImportSource @emotion/react */
import { TaskCheckbox } from "@features/task-el";
import { Tile } from "../model/types"
import { Circle } from "@shared/components/Circle";
import { getCustomAccentHSL } from "@shared/components/obsidian-accent-color";
import { Day } from "@shared/period/day";
import { Badge } from "@mui/material";







type Props = {
  tile: Tile;
}
export const CalendarTile = ({
  tile,
}: Props) => {
  const isActive = tile.state !== "inactive";
  const isTodayOrBefore = tile.day.isSameOrBefore(Day.today());
  const color = isActive && isTodayOrBefore ? "var(--color-accent)" : "#ececec";
  const opacity = isActive && isTodayOrBefore ? 1 : 0.5;
  
  return (
    <div css={{
      position: "relative",
    }}>
      <Badge badgeContent="Tdy" color="primary" overlap="circular" invisible={!tile.day.isToday()} css={{
        "& > .MuiBadge-badge": {
          padding: "2px 5px",
          height: "fit-content",
        }
      }}>
        <Circle
          color={color}
          css={{opacity}}
          percentage={100}
          rotate={-90}
          strokeWidth={10}
        />
      </Badge>
      <div css={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity,
      }}>
        <div>{tile.day.date}</div>
        <div css={{
          fontSize: "1.2em",
          textAlign: "center",

        }}>
          { tile.state === "inactive" || !isTodayOrBefore
            ?
            <TaskCheckbox
              state={"un-checked"}
              css={{
                visibility: "hidden",
              }}
              size={14}
            />
            :
            <TaskCheckbox
              state={tile.state}
              size={14}
            />
          }
        </div>
      </div>
    </div>
  )
}