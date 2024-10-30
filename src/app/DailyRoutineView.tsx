/** @jsxImportSource @emotion/react */
import { RoutineNote } from 'pages/routine-note';
import { RoutineCalendar } from "pages/calendar";
import { useCallback, useMemo } from "react";
import { Day } from "shared/day";
import { usePageRoute } from "./use-page-route";
import "./style.css";
import { DailyRoutineObsidianView } from './obsidian-view';
import { useLeaf } from 'shared/view/react-view';
import { Button } from 'shared/components/Button';



const pageNavbarHeight = 50;



// FIXME: setPage로 렌더링 1번, cmd를 적용해서 다시 렌더링까지 총 2번의 렌더링이 발생한다. 추후 여건되면 최적화 가능
export const DailyRoutineView = () => {
  const { page, routedDay, routePage } = usePageRoute();

  const onDayTileClick = useCallback((day: Day) => {
    routePage("note", day.clone());
  }, [routePage]);

  const { view } = useLeaf<DailyRoutineObsidianView>();

  const viewContentRealHeight = useMemo(() => {
    const viewContainer = view.contentEl;

    const height = viewContainer.innerHeight;
    const computedStyle = getComputedStyle(viewContainer);
    const paddingBottom = parseInt(computedStyle.paddingBottom);
    return height + paddingBottom;
  }, [view.contentEl]);

  
  return (
    <div 
      className='dr-page' 
      style={{
        scrollbarWidth: "none",
        height: (viewContentRealHeight - pageNavbarHeight - 1), // 1은 offset
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
          height: pageNavbarHeight,
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
    <Button
      css={{
        display: "block",
        alignSelf: "stretch",
        height: "auto",
        width: "100%",
        borderRadius: "0.2em 0.2em 0 0",
        fontWeight: "var(--font-weight)"
      }}
      accent={active} 
      onClick={onClick}
    >
      {children}
    </Button>
  );
}