import { useTabRoute } from "@shared/use-tab-route";
import { Day } from "@shared/day";
import { useMemo } from "react";
import { AchivementPage } from "@pages/calendar/RoutineCalendar";



interface AchivementTabRouteParams {
  day: Day;
}

export const AchivementTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<AchivementTabRouteParams>(() => {
    if(routeParams){
      const params = routeParams as AchivementTabRouteParams;
      if(!params.day){
        throw new Error("Invalid AchivementTab tab routeParams.");
      }
      return params;
    } else {
      return { day: Day.now() };
    }
  }, [routeParams]);

  if(tab !== "achivement") return null;
  return (
    <>
      <AchivementPage day={params.day} />
    </>
  )
}