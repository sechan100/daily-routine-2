import { TaskCalendar } from "@pages/calendar";
import { Month } from "@shared/period/month";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useMemo } from "react";



// useTabRoute에서 받을 params의 타입
interface CalendarTabRouteParams {
  month: Month;
}

export const CalendarTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<CalendarTabRouteParams>(() => {
    if (tab === "calendar" && routeParams) {
      const params = routeParams as CalendarTabRouteParams;
      if (!params.month) {
        throw new Error("Invalid CalendarTab tab routeParams.");
      }
      return params;
    } else {
      return { month: Month.now() };
    }
  }, [routeParams, tab]);

  if (tab !== "calendar") return null;
  return (
    <>
      <TaskCalendar month={params.month} />
    </>
  )
}