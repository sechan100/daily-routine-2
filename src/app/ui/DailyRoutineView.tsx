/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav, { TabsActions } from '@mui/material/Tabs';
import { Icon } from "@shared/components/Icon";
import { t } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { DrTabType, useTabRoute } from "@shared/tab/use-tab-route";
import { useTodayWatcher } from "@shared/today/use-today";
import { useLeaf } from "@shared/view/use-leaf";
import { useCallback, useEffect, useRef, useState } from "react";
import { MUIThemeProvider } from './MUIThemeProvider';
import "./style.css";
import { AchievementTab } from "./tab-achievement";
import { CalendarTab } from "./tab-calendar";
import { RouitneNoteTab } from "./tab-note";

export const num_tabsHeight = 50;
export const num_tabsBottomGap = 25;
export const tabsHeight = `${num_tabsHeight}px`;
export const tabsBottomGap = `${num_tabsBottomGap}px`;
// 이 폭보다 좁으면 세 탭의 이름이 한 줄에 들어가지 않는다.
const COMPACT_TABS_MAX_WIDTH = 360;

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  height: tabsHeight,
  fontSize: "0.7em",
  // 키보드 focus는 MUI의 focus ripple 대신 얇은 테두리로 표시한다.
  "&.Mui-focusVisible": {
    outline: "2px solid var(--background-modifier-border-focus)",
    outlineOffset: "-4px",
    borderRadius: "var(--radius-m)",
  },
})

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const DailyRoutineView = () => {
  const { tab, route } = useTabRoute();
  const { view, leafBgColor } = useLeaf();
  const tabsActionRef = useRef<TabsActions>(null);
  // 좁은 사이드바에서는 탭 이름이 잘리므로 아이콘만 보여준다. (이름은 aria-label 툴팁으로 남는다)
  const [compactTabs, setCompactTabs] = useState(false);
  useTodayWatcher(view.containerEl);

  useEffect(() => {
    view.contentEl.classList.add("no-padding");
  }, [view]);

  // MUI Tabs는 window resize 때만 indicator 위치를 다시 계산하므로, 사이드바 폭을 바꾸면 indicator가 어긋난다.
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setCompactTabs(view.contentEl.clientWidth < COMPACT_TABS_MAX_WIDTH);
      tabsActionRef.current?.updateIndicator();
    });
    observer.observe(view.contentEl);
    return () => observer.disconnect();
  }, [view]);

  const onTabChange = useCallback((_e: React.SyntheticEvent, tab: DrTabType) => {
    switch(tab){
      case "note":
        route(tab, { day: Day.today() });
        break;
      case "achievement":
        route(tab, { month: Month.now() });
        break
      case "calendar":
        route(tab, { month: Month.now() });
        break;
    }
  }, [route]);


  return (
    <MUIThemeProvider>
      <div
        // 탭을 바꿀 때마다 새로 마운트되어 짧게 fade-in 된다.
        key={tab}
        className="dr-tab"
        css={{
          height: `calc(100% - ${tabsHeight} - ${tabsBottomGap})`,
          animation: `${fadeIn} 150ms ease-out`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        <RouitneNoteTab />
        <AchievementTab />
        <CalendarTab />
      </div>
      <TabNav
        value={tab}
        action={tabsActionRef}
        className="dr-tabs"
        scrollButtons={false}
        centered
        sx={{ borderTop: 1, borderColor: 'divider' }}
        onChange={onTabChange}
        css={{
          zIndex: 1000,
          backgroundColor: leafBgColor,
          position: "fixed",
          minHeight: 0,
          width: "100%",
          left: "0",
          bottom: tabsBottomGap,
        }}
      >
        <TabNavItem
          label={compactTabs ? undefined : t("shell.tab.note")}
          aria-label={t("shell.tab.note")}
          value={"note"}
          icon={<Icon icon="notebook-pen" />}
          iconPosition="start"
          disableFocusRipple
          css={tabCss}
        />
        <TabNavItem
          label={compactTabs ? undefined : t("shell.tab.calendar")}
          aria-label={t("shell.tab.calendar")}
          value={"calendar"}
          icon={<Icon icon="calendar-check-2" />}
          iconPosition="start"
          disableFocusRipple
          css={tabCss}
        />
        <TabNavItem
          label={compactTabs ? undefined : t("shell.tab.achievement")}
          aria-label={t("shell.tab.achievement")}
          value={"achievement"}
          icon={<Icon icon="book-check" />}
          iconPosition="start"
          disableFocusRipple
          css={tabCss}
        />
      </TabNav>
      <div css={{
        display: "block",
        position: "fixed",
        width: "100%",
        height: tabsBottomGap,
        backgroundColor: leafBgColor,
        bottom: 0,
        zIndex: 1000,
      }} />
    </MUIThemeProvider>
  );
}
