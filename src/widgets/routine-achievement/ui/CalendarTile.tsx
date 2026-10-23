/** @jsxImportSource @emotion/react */
import { TaskCheckbox } from "@features/task-el";
import { Tile } from "../model/types"
import { Circle } from "@shared/components/Circle";
import { calendarSkeletonCss, TODAY_SOFT_BG } from "@shared/components/BaseCalendar";
import { formatNumber } from "@shared/i18n";
import { Day } from "@shared/period/day";


const fillCss = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
} as const;


type Props = {
  tile: Tile;
  today: Day;
  // 행 높이. 너비가 좁으면 너비에, 높이가 모자라면 이 값에 맞춰 원 크기가 정해진다.
  maxHeight: number;
  loading?: boolean;
}
export const CalendarTile = ({
  tile,
  today,
  maxHeight,
  loading = false,
}: Props) => {
  const isToday = tile.day.isSameDay(today);
  // 루틴이 예정됐던 날 중 결과가 정해질 수 있는 날(오늘까지)만 강조한다.
  const isActive = !loading && tile.state !== "inactive" && tile.day.wholeDayDiff(today) <= 0;
  
  return (
    <div css={[{
      position: "relative",
      width: "100%",
      aspectRatio: "1 / 1",
      minHeight: 0,
      maxHeight,
    }, loading && calendarSkeletonCss]}>
      <Circle
        css={[fillCss, { opacity: isActive ? 1 : 0.5 }]}
        color={isActive ? "var(--interactive-accent)" : "var(--background-modifier-border)"}
        percentage={100}
        transition={false}
        strokeWidth={10}
        fill={isToday ? TODAY_SOFT_BG : undefined}
      />
      <div css={{
        ...fillCss,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        lineHeight: 1,
        opacity: isActive || isToday ? 1 : 0.5,
      }}>
        <span css={[{
          fontSize: "var(--font-ui-smaller)",
          color: "var(--text-normal)",
        }, isToday && {
          color: "var(--text-accent)",
          fontWeight: "var(--font-bold)",
        }]}>
          {formatNumber(tile.day.date)}
        </span>
        <TaskCheckbox
          state={isActive && tile.state !== "inactive" ? tile.state : "un-checked"}
          css={{
            visibility: isActive ? "visible" : "hidden",
            pointerEvents: "none",
          }}
          size={11}
        />
      </div>
    </div>
  )
}
