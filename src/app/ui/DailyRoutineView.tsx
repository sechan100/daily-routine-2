/** @jsxImportSource @emotion/react */
import { useNoteDayStore } from "@/entities/note";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { AppDndProvider } from "@/shared/dnd/AppDndProvider";
import { Day } from "@/shared/period/day";
import { ReactQueryProvider } from "@/shared/react-query/ReactQueryProvider";
import { PageType } from "@/shared/route/page-type";
import { useRouter } from "@/shared/route/use-router";
import { num_tabsBottomGap, num_tabsHeight } from "@/shared/use-tab-height";
import { useLeaf } from "@/shared/view/use-leaf";
import { css } from "@emotion/react";
import TabNavItem from '@mui/material/Tab';
import TabNav from '@mui/material/Tabs';
import { useCallback, useEffect, useMemo } from "react";
import { MUIThemeProvider } from './MUIThemProvider';
import "./style.css";

export const tabsHeight = `${num_tabsHeight}px`;
export const tabsBottomGap = `${num_tabsBottomGap}px`;

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  height: tabsHeight,
  fontSize: "0.7em",
})

const notePage: PageType = "note";
const calendarPage: PageType = "calendar";
const taskQueuePage: PageType = "queue";

export const DailyRoutineView = () => {
  const setDay = useNoteDayStore(state => state.setDay);
  const { current, pages, route } = useRouter();
  const { view } = useLeaf();

  useEffect(() => {
    view.contentEl.classList.add("no-padding");
  }, [view]);

  const tab = useMemo<PageType | boolean>(() => {
    if (!current || !pages) return false;
    const p = current.name;
    if (p !== notePage && p !== calendarPage && p !== taskQueuePage) {
      return false;
    }
    return p;
  }, [current, pages]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newpage: PageType) => {
    if (current && newpage !== current.name) {
      route(newpage);
    }
  }, [current, route]);

  const handleNoteTabClick = useCallback(() => {
    // note tab을 클릭하면 현재 day로 설정
    setDay(Day.today());
  }, [setDay]);


  if (!current || !pages) {
    return <div>Error</div>
  }

  return (
    <MUIThemeProvider>
      <ReactQueryProvider>
        <AppDndProvider>
          <div
            className="dr-tab"
            css={{
              height: `calc(100% - ${tabsHeight} - ${tabsBottomGap})`,
            }}
          >
            <current.Page />
          </div>
          <TabNav
            value={tab}
            scrollButtons={false}
            centered
            sx={{ borderTop: 1, borderColor: 'divider' }}
            onChange={handleTabChange}
            css={{
              zIndex: 1000,
              backgroundColor: "inherit",
              position: "fixed",
              minHeight: 0,
              width: "100%",
              left: "0",
              bottom: tabsBottomGap,
            }}
          >
            <TabNavItem
              label="Note"
              value={notePage}
              onClick={handleNoteTabClick}
              icon={<ObsidianIcon icon="notebook-pen" />}
              iconPosition="start"
              css={tabCss}
            />
            <TabNavItem
              label="Calendar"
              value={calendarPage}
              icon={<ObsidianIcon icon="calendar-check-2" />}
              iconPosition="start"
              css={tabCss}
            />
            <TabNavItem
              label="Queue"
              value={taskQueuePage}
              icon={<ObsidianIcon icon="list-check" />}
              iconPosition="start"
              css={tabCss}
            />
          </TabNav>
          <div css={{
            display: "block",
            position: "fixed",
            width: "100%",
            height: tabsBottomGap,
            backgroundColor: "inherit",
            bottom: 0,
            zIndex: 1000,
          }} />
        </AppDndProvider>
      </ReactQueryProvider>
    </MUIThemeProvider>
  );
}