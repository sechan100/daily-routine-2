/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { RoutineNote } from '@pages/routine-note';
import { RoutineCalendar } from "@pages/calendar";
import { useCallback, useEffect, useMemo } from "react";
import { Day } from "@shared/day";
import { DrTabType, useTabRoute } from "@shared/use-tab-route";
import "./style.css";
import { DailyRoutineObsidianView } from '../obsidian-view';
import { useLeaf } from '@shared/view/react-view';
import TabNav from '@mui/material/Tabs';
import TabNavItem from '@mui/material/Tab';
import { MUIThemeProvider } from './MUIThemProvider';
import { Icon } from "@shared/components/Icon";
import { RouitneNoteTab } from "./tab-note";
import { AchivementTab } from "./tab-achivement";

const tabsHeight = "50px";
const tabsBottomGap = "25px";

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
})

export const DailyRoutineView = () => {
  const { tab, route } = useTabRoute();

  const { view } = useLeaf<DailyRoutineObsidianView>();

  useEffect(() => {
    view.contentEl.style.padding = "0";
  }, [view]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTabChange = useCallback((e: React.SyntheticEvent, tab: DrTabType) => {
    const routeParams = { day: Day.now() };
    route(tab, routeParams);
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
      </div>
      <TabNav
        value={tab}
        className="dr-tabs"
        scrollButtons={false}
        centered
        sx={{ borderTop: 1, borderColor: 'divider' }}
        onChange={onTabChange}
        css={{
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
    </MUIThemeProvider>
  );
}
