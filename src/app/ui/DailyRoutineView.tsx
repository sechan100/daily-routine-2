/** @jsxImportSource @emotion/react */
import { Icon } from "@/shared/components/Icon";
import { AppDndProvider } from "@/shared/dnd/AppDndProvider";
import { Day } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { DrTabType, useTabRoute } from "@/shared/tab/use-tab-route";
import { num_tabsBottomGap, num_tabsHeight } from "@/shared/use-tab-height";
import { useLeaf } from "@/shared/view/use-leaf";
import { css } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useCallback, useEffect } from "react";
import { MUIThemeProvider } from './MUIThemProvider';
import "./style.css";
import { AchivementTab } from "./tab-achivement";
import { CalendarTab } from "./tab-calendar";
import { RouitneNoteTab } from "./tab-note";

export const tabsHeight = `${num_tabsHeight}px`;
export const tabsBottomGap = `${num_tabsBottomGap}px`;

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  height: tabsHeight,
  fontSize: "0.7em",
})

export const DailyRoutineView = () => {
  const { tab, route } = useTabRoute();
  const { view, leafBgColor } = useLeaf();

  useEffect(() => {
    view.contentEl.classList.add("no-padding");
  }, [view]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTabChange = useCallback((e: React.SyntheticEvent, tab: DrTabType) => {
    switch (tab) {
      case "note":
        route(tab, { day: Day.today() });
        break;
      case "achivement":
        route(tab, { month: Month.now() });
        break
      case "calendar":
        route(tab, { month: Month.now() });
        break;
    }
  }, [route]);


  return (
    <MUIThemeProvider>
      <AppDndProvider>
        <div
          className="dr-tab"
          css={{
            height: `calc(100% - ${tabsHeight} - ${tabsBottomGap})`,
          }}
        >
          <RouitneNoteTab />
          <AchivementTab />
          <CalendarTab />
        </div>
        <TabNav
          value={tab}
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
            label="Note"
            value={"note"}
            icon={<Icon icon="notebook-pen" />}
            iconPosition="start"
            css={tabCss}
          />
          <TabNavItem
            label="Calendar"
            value={"calendar"}
            icon={<Icon icon="calendar-check-2" />}
            iconPosition="start"
            css={tabCss}
          />
          <TabNavItem
            label="Achivement"
            value={"achivement"}
            icon={<Icon icon="book-check" />}
            iconPosition="start"
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
      </AppDndProvider>
    </MUIThemeProvider>
  );
}