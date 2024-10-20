/** @jsxImportSource @emotion/react */
import { RoutineNote } from 'pages/routine-note';
import { RoutineCalendar } from "pages/calendar";
import { useCallback, useEffect, useState } from "react";
import { css } from "@emotion/react";
import { Day } from "shared/day";
import { usePageRoute } from "./use-page-route";
import { Button } from "shared/components/Button";
import "./style.css";
import { ActiveButton } from 'shared/components/ToggleButton';
import { textCss } from 'shared/components/font';


// FIXME: setPage로 렌더링 1번, cmd를 적용해서 다시 렌더링까지 총 2번의 렌더링이 발생한다. 추후 여건되면 최적화 가능
export const DailyRoutineView = () => {
  const { page, setPage, setPageCmd } = usePageRoute();

  ////////////////////////////////////////
  // cmd로 props가 넘어왔을 때 넘겨주기위한 refs
  const [ noteDay, setNoteDay ] = useState<Day>(Day.now());
  const [ calendarDay, setCalendarDay ] = useState<Day>(Day.now());
  // setPageCmd가 요청되었을 때, 넘어온 데이터를 적용해주기위한 useEffect
  useEffect(() => {
    if(!setPageCmd || !setPageCmd.data) return;
    switch(setPageCmd.page){
      case "note":
        setNoteDay(setPageCmd.data.day);
        break;
      case "calendar":
        setCalendarDay(setPageCmd.data.day);
        break;
    }
  }, [setPage, setPageCmd]);


  ////////////////////////////////////////
  // calendar day tile 클릭시 콜백
  const onDayTileClick = useCallback((day: Day) => {
    setPage({page: "note", data: {day}});
  }, [setPage]);

  return (
    <div>
      {page === "note" && <RoutineNote day={noteDay} />}
      {page === "calendar" && <RoutineCalendar onDayTileClick={onDayTileClick} defaultDay={calendarDay} />}
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
        <ViewNavItem active={page==="note"} onClick={() => setPage({page: "note"})}>Routine Note</ViewNavItem>
        <ViewNavItem active={page==="calendar"} onClick={() => setPage({page: "calendar"})}>Calendar</ViewNavItem>
        <ViewNavItem active={page==="achivement"} onClick={() => setPage({page: "achivement"})}>Achivement</ViewNavItem>
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