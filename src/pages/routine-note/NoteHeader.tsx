/** @jsxImportSource @emotion/react */
import { Icon } from "@shared/components/Icon";
import { t } from "@shared/i18n";
import { MenuComponent } from "@shared/components/Menu";
import { Day } from "@shared/period/day";
import { Menu } from "obsidian";
import { noteDateLabel, relativeDayLabel } from "./day-label";


// 스켈레톤과 같은 높이를 쓰기 위해 고정한다.
export const NOTE_HEADER_HEIGHT = "3.5em";

// 넓은 pane에서 헤더와 task 목록이 한없이 늘어나지 않도록 폭을 제한한다.
export const NOTE_CONTENT_MAX_WIDTH = "720px";


interface NoteHeaderProps {
  day: Day;
  today: Day;
  className?: string;
  onGoToToday: () => void;
  onAddTodo: () => void;
  onMenuShow: (menu: Menu) => void;
}
export const NoteHeader = ({
  day,
  today,
  className,
  onGoToToday,
  onAddTodo,
  onMenuShow,
}: NoteHeaderProps) => {
  const isToday = day.isSameDay(today);

  return (
    <div css={{
      flexShrink: 0,
      borderBottom: "1px solid var(--background-modifier-border)",
    }}>
      <header
        className={className}
        css={{
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          boxSizing: "border-box",
          height: NOTE_HEADER_HEIGHT,
          maxWidth: NOTE_CONTENT_MAX_WIDTH,
          margin: "0 auto",
          paddingInline: "0.75em 0.5em",
        }}
      >
        {/* 날짜는 두 줄로 고정해서, 날짜를 오가도 헤더 높이가 바뀌지 않고 좁은 사이드바에서도 버튼과 겹치지 않게 한다. */}
        <div css={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
        }}>
          <span css={{
            fontSize: "1.1em",
            fontWeight: "var(--font-bold)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {noteDateLabel(day, today)}
          </span>
          <span css={{
            fontSize: "var(--font-ui-smaller)",
            color: isToday ? "var(--text-accent)" : "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {relativeDayLabel(day, today)}
          </span>
        </div>
        {!isToday && (
          <button
            type="button"
            aria-label={t("shell.action.goToToday")}
            onClick={onGoToToday}
            css={{
              flexShrink: 0,
              height: "auto",
              padding: "var(--size-2-1) var(--size-4-2)",
              fontSize: "var(--font-ui-smaller)",
            }}
          >
            {t("common.today")}
          </button>
        )}
        <div css={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <Icon icon="plus" ariaLabel={t("shell.action.addTodo")} onClick={onAddTodo} />
          <MenuComponent icon="ellipsis-vertical" ariaLabel={t("shell.note.moreOptions")} onMenuShow={onMenuShow} />
        </div>
      </header>
    </div>
  )
}
