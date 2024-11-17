import { useTabRoute } from "@shared/use-tab-route";
import { Day } from "@shared/day";
import { useMemo } from "react";
import { CalendarPage } from "@pages/calendar";



interface CalendarTabRouteParams {
  day: Day;
}

export const CalendarTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<CalendarTabRouteParams>(() => {
    if(routeParams){
      const params = routeParams as CalendarTabRouteParams;
      if(!params.day){
        throw new Error("Invalid CalendarTab tab routeParams.");
      }
      return params;
    } else {
      return { day: Day.now() };
    }
  }, [routeParams]);

  if(tab !== "calendar") return null;
  return (
    <>
      <CalendarPage day={params.day} />
    </>
  )
}