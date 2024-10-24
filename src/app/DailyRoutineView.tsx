/** @jsxImportSource @emotion/react */
import { RoutineNote } from 'pages/routine-note';
import { RoutineCalendar } from "pages/calendar";
import { useCallback, useEffect, useState } from "react";
import { css } from "@emotion/react";
import { Day } from "shared/day";
import { usePageRoute } from "./use-page-route";
import "./style.css";
import { ActiveButton } from 'shared/components/ToggleButton';


// FIXME: setPage로 렌더링 1번, cmd를 적용해서 다시 렌더링까지 총 2번의 렌더링이 발생한다. 추후 여건되면 최적화 가능
export const DailyRoutineView = () => {
  const { page, routedDay, routePage } = usePageRoute();

  const onDayTileClick = useCallback((day: Day) => {
    routePage("note", day.clone());
  }, [routePage]);

  
  return (
    <div className='dr-page' css={{height: "100%"}}>
      {page === "note" && <RoutineNote day={routedDay} />}
      {page === "calendar" && <RoutineCalendar onDayTileClick={onDayTileClick} defaultDay={routedDay} />}
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          position: "fixed",
          width: "100%",
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
      css={css`
        display: block;
        width: 100%;
        border-radius: 0.2em 0.2em 0 0;
        font-weight: var(--font-weight);
      `}
      active={active} 
      onClick={onClick}
    >
      {children}
    </ActiveButton>
  );
}