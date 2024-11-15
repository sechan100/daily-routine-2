import { useTabRoute } from "@shared/use-tab-route";
import { RoutineNote } from "@pages/routine-note";
import { Day } from "@shared/day";
import { useMemo } from "react";



interface RoutineNoteRouteParams {
  day: Day;
}

export const RouitneNoteTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<RoutineNoteRouteParams>(() => {
    if(routeParams){
      const params = routeParams as RoutineNoteRouteParams;
      if(!params.day){
        throw new Error("Invalid routine note tab routeParams.");
      }
      return params;
    } else {
      return { day: Day.now() };
    }
  }, [routeParams]);
  
  if(tab !== "note") return null;
  return (
    <>
      <RoutineNote day={params.day} />
    </>
  )
}