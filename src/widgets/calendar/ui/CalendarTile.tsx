/** @jsxImportSource @emotion/react */
import { DR_SETTING } from "@app/settings/setting-provider";
import { formatNumber, t } from "@shared/i18n";
import { Day, DayOfWeek } from "@shared/period/day";
import { Tile } from "../model/types";
import { Task, TaskState } from "@entities/note";
import { css } from "@emotion/react";
import { calendarSkeletonCss, TODAY_SOFT_BG } from "@shared/components/BaseCalendar";
import { TileHeightInfo, TILE_LAYOUT } from "./tile-height-info-context";


/**
 * 주말 음영을 줄 요일인지. 토요일 시작 주(중동)는 금·토가 주말이고, 그 밖에는 토·일이다.
 */
export const isWeekendDow = (dow: DayOfWeek, weekStartDow: 0 | 1 | 6): boolean => {
  const weekend = weekStartDow === 6 ? [DayOfWeek.FRI, DayOfWeek.SAT] : [DayOfWeek.SAT, DayOfWeek.SUN];
  return weekend.includes(dow);
}

const DateBadge = ({ day, isToday }: { day: Day, isToday: boolean }) => {
  const isWeekend = isWeekendDow(day.dow, DR_SETTING.weekStartDow());

  return (
    <div css={{
      display: "flex",
      justifyContent: "center",
      height: TILE_LAYOUT.dateRowHeight - 2,
      marginBottom: 2,
    }}>
      <span css={[{
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 9,
        lineHeight: "18px",
        textAlign: "center",
        fontSize: "var(--font-ui-smaller)",
        color: isWeekend ? "var(--text-muted)" : "var(--text-normal)",
      }, isToday && {
        backgroundColor: TODAY_SOFT_BG,
        color: "var(--text-accent)",
        fontWeight: "var(--font-bold)",
      }]}>
        {formatNumber(day.date)}
      </span>
    </div>
  )
}


const chipBaseCss = css({
  boxSizing: "border-box",
  height: TILE_LAYOUT.chipHeight,
  padding: "1px 3px",
  borderRadius: 3,
  fontSize: 10,
  lineHeight: `${TILE_LAYOUT.chipHeight - 2}px`,
  textAlign: "start",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  backgroundColor: "var(--background-modifier-hover)",
  // 이름이 오른쪽에서 왼쪽으로 쓰는 언어면 강조선도 오른쪽에 붙는다. (칩의 dir=auto를 따른다)
  borderInlineStart: "2px solid var(--interactive-accent)",
  color: "var(--text-normal)",
});

// 노트가 있는 날은 task 상태를 칩에 반영한다. (노트가 없는 날의 루틴은 항상 un-checked)
const chipStateCss: Record<TaskState, ReturnType<typeof css> | null> = {
  "un-checked": null,
  "accomplished": css({
    color: "var(--text-faint)",
    textDecoration: "line-through",
    borderInlineStartColor: "var(--text-faint)",
  }),
  "failed": css({
    color: "var(--text-muted)",
    borderInlineStartColor: "var(--text-error)",
  }),
};

const taskChipLabel = (task: Task): string => {
  switch(task.state){
    case "accomplished": return t("stats.calendar.taskDone", { name: task.name });
    case "failed": return t("stats.calendar.taskFailed", { name: task.name });
    default: return task.name;
  }
}

const TaskChip = ({ task }: { task: Task }) => {
  return (
    <div
      // 사용자가 쓴 이름이라 아랍어·히브리어일 수 있다.
      dir="auto"
      css={[chipBaseCss, chipStateCss[task.state]]}
      aria-label={taskChipLabel(task)}
    >
      {task.name}
    </div>
  )
}


const chipListCss = css({
  display: "flex",
  flexDirection: "column",
  gap: TILE_LAYOUT.chipGap,
  minWidth: 0,
});

const TaskChipList = ({ tasks, limit }: { tasks: Task[], limit: number }) => {
  // 넘치면 마지막 한 줄을 '+N'에 양보한다.
  const overflow = tasks.length > limit;
  const visible = overflow ? tasks.slice(0, limit - 1) : tasks;
  const hiddenCount = tasks.length - visible.length;
  return (
    <div className="dr-calendar-tasks" css={chipListCss}>
      {visible.map(task => (
        <TaskChip key={task.name} task={task} />
      ))}
      {overflow && (
        // '+N'을 줄 수 있는 칸이 한 줄이라 가려지는 개수는 항상 2 이상이다. (복수형만 필요)
        <div
          aria-label={t("stats.calendar.moreTasks", { count: formatNumber(hiddenCount) })}
          css={{
            height: TILE_LAYOUT.chipHeight,
            lineHeight: `${TILE_LAYOUT.chipHeight}px`,
            fontSize: 10,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          {t("stats.calendar.more", { count: formatNumber(hiddenCount) })}
        </div>
      )}
    </div>
  )
}

const SkeletonChips = ({ limit }: { limit: number }) => {
  return (
    <div css={[chipListCss, calendarSkeletonCss]}>
      {["80%", "55%"].slice(0, limit).map(width => (
        <div key={width} css={{
          width,
          height: TILE_LAYOUT.chipHeight,
          borderRadius: 3,
          backgroundColor: "var(--background-modifier-hover)",
        }} />
      ))}
    </div>
  )
}


type Props = {
  tile: Tile;
  layout: TileHeightInfo;
  today: Day;
  loading?: boolean;
}
export const CalendarTile = ({ tile, layout, today, loading = false }: Props) => {
  return (
    <div css={{
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      padding: `${TILE_LAYOUT.paddingY}px 2px`,
      overflow: "hidden",
    }}>
      <DateBadge day={tile.day} isToday={tile.day.isSameDay(today)} />
      {loading
        ? <SkeletonChips limit={layout.limitedTaskPer} />
        : <TaskChipList tasks={tile.tasks} limit={layout.limitedTaskPer} />
      }
    </div>
  )
}
