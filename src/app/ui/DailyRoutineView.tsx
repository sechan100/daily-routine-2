/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { Icon } from "@shared/components/Icon";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { DrTabType, useTabRoute } from "@shared/tab/use-tab-route";
import { useLeaf } from "@shared/view/use-leaf";
import { useCallback, useEffect } from "react";
import { MUIThemeProvider } from './MUIThemProvider';
import "./style.css";
import { AchivementTab } from "./tab-achivement";
import { CalendarTab } from "./tab-calendar";
import { RouitneNoteTab } from "./tab-note";

export const num_tabsHeight = 50;
export const num_tabsBottomGap = 25;
export const tabsHeight = `${num_tabsHeight}px`;
export const tabsBottomGap = `${num_tabsBottomGap}px`;

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
})

export const DailyRoutineView = () => {
  const { tab, route } = useTabRoute();

  const { view, leafBgColor } = useLeaf();

  useEffect(() => {
    view.contentEl.style.padding = "0";
  }, [view]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTabChange = useCallback((e: React.SyntheticEvent, tab: DrTabType) => {
    switch(tab){
      case "note": 
        route(tab, { day: Day.now() });
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
          height: tabsHeight,
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
    </MUIThemeProvider>
  );
}