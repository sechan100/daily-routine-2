/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { RoutineNote } from 'pages/routine-note';
import { RoutineCalendar } from "pages/calendar";
import { useCallback, useEffect, useMemo } from "react";
import { Day } from "shared/day";
import { usePageRoute } from "./use-page-route";
import "./style.css";
import { DailyRoutineObsidianView } from './obsidian-view';
import { useLeaf } from 'shared/view/react-view';
import { Button } from 'shared/components/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MUIThemeProvider } from './MUIThemProvider';
import { Box } from '@mui/material';
import { Icon } from "shared/components/Icon";



const tabsHeight = "50px";
const tabsBottomGap = "25px";

const tabCss = css({
  boxShadow: "none !important",
  backgroundColor: "transparent !important",
  minHeight: "0 !important",
  fontSize: "0.7em",
})


// FIXME: setPage로 렌더링 1번, cmd를 적용해서 다시 렌더링까지 총 2번의 렌더링이 발생한다. 추후 여건되면 최적화 가능
export const DailyRoutineView = () => {
  const { page, routedDay, routePage } = usePageRoute();

  const onDayTileClick = useCallback((day: Day) => {
    routePage("note", day.clone());
  }, [routePage]);

  const { view } = useLeaf<DailyRoutineObsidianView>();
  useEffect(() => {
    view.contentEl.style.padding = "0";
  }, [view]);

  const viewContentRealHeight = useMemo(() => {
    const viewContainer = view.contentEl;

    const height = viewContainer.innerHeight;
    const computedStyle = getComputedStyle(viewContainer);
    const paddingBottom = parseInt(computedStyle.paddingBottom);
    return height + paddingBottom;
  }, [view.contentEl]);

  
  return (
    <MUIThemeProvider>
      <div 
        className="dr-page"
        css={{
          height: `calc(100% - ${tabsHeight} - ${tabsBottomGap})`,
        }}
      >
        {page === "note" && <RoutineNote day={routedDay} />}
        {page === "calendar" && <RoutineCalendar onDayTileClick={onDayTileClick} defaultDay={routedDay} />}
      </div>
      <Tabs
        value={page}
        className="dr-tabs"
        scrollButtons={false}
        centered
        sx={{ borderTop: 1, borderColor: 'divider' }}
        onChange={(e, value) => routePage(value, Day.now())}
        css={{
          position: "fixed",
          height: tabsHeight,
          width: "100%",
          left: "0",
          bottom: tabsBottomGap,
        }}
      >
        <Tab icon={<Icon icon="notebook-pen" />} iconPosition="start" label="Note" css={tabCss} value={"note"} />
        <Tab icon={<Icon icon="calendar-check-2" />} iconPosition="start" label="Calendar" css={tabCss} value={"calendar"} />
        <Tab icon={<Icon icon="book-check" />} iconPosition="start" label="Achivement" css={tabCss} value={"achivement"} />
      </Tabs>
    </MUIThemeProvider>
  );
}
