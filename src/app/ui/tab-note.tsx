import { useTabRoute } from "@shared/use-tab-route";
import { RoutineNotePage } from "@pages/routine-note";
import { Day } from "@shared/period/day";
import { useMemo } from "react";


// useTabRoute에서 받을 params의 타입
interface RoutineNoteRouteParams {
  day: Day;
}

export const RouitneNoteTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<RoutineNoteRouteParams>(() => {
    if(tab === "note" && routeParams){
      const params = routeParams as RoutineNoteRouteParams;
      if(!params.day){
        throw new Error("Invalid routine note tab routeParams.");
      }
      return params;
    } else {
      return { day: Day.now() };
    }
  }, [routeParams, tab]);
  
  if(tab !== "note") return null;
  return (
    <>
      <RoutineNotePage day={params.day} />
    </>
  )
}