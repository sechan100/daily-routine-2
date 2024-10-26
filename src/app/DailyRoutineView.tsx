/** @jsxImportSource @emotion/react */
import { RoutineNote } from 'pages/routine-note';
import { RoutineCalendar } from "pages/calendar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { Day } from "shared/day";
import { usePageRoute } from "./use-page-route";
import "./style.css";
import { ActiveButton } from 'shared/components/ToggleButton';
import { plugin } from 'shared/plugin-service-locator';
import { DailyRoutineObsidianView } from './obsidian-view';
import { useLeaf } from 'shared/view/react-view';


// FIXME: setPage로 렌더링 1번, cmd를 적용해서 다시 렌더링까지 총 2번의 렌더링이 발생한다. 추후 여건되면 최적화 가능
export const DailyRoutineView = () => {
  const { page, routedDay, routePage } = usePageRoute();

  const onDayTileClick = useCallback((day: Day) => {
    routePage("note", day.clone());
  }, [routePage]);

  const leaf = useLeaf();

  const viewContentRealHeight = useMemo(() => {
    const viewContainer = leaf.view.containerEl;

    const height = viewContainer.innerHeight;
    const computedStyle = getComputedStyle(viewContainer);
    const paddingBottom = parseInt(computedStyle.paddingBottom);
    return height + paddingBottom;
  }, [leaf.view.containerEl]);

  
  return (
    <div 
      className='dr-page' 
      css={{
        "--dr-nav-height": "2.5em",
        height: `calc(${viewContentRealHeight}px - var(--dr-nav-height))`,
      }}
    >
      {page === "note" && <RoutineNote day={routedDay} />}
      {page === "calendar" && <RoutineCalendar onDayTileClick={onDayTileClick} defaultDay={routedDay} />}
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          position: "fixed",
          width: "100%",
          height: "var(--dr-nav-height)",
          left: "0",
          bottom: "0",
        }}
      >
        <ViewNavItem active={page==="note"} onClick={() => routePage("note", Day.now())}>Routine Note</ViewNavItem>
        <ViewNavItem active={page==="calendar"} onClick={() => routePage("calendar", Day.now())}>Calendar</ViewNavItem>
        <ViewNavItem active={page==="achivement"} onClick={() => routePage("achivement", Day.now())}>Achivement</ViewNavItem>
      </div>
    </div>
  );
}


interface ViewNavItemProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
const ViewNavItem = ({ active, onClick, children }: ViewNavItemProps) => {
  return (
    <ActiveButton
      css={{
        display: "block",
        alignSelf: "stretch",
        height: "auto",
        width: "100%",
        borderRadius: "0.2em 0.2em 0 0",
        fontWeight: "var(--font-weight)"
      }}
      active={active} 
      onClick={onClick}
    >
      {children}
    </ActiveButton>
  );
}