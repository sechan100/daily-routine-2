import { AchievementPage } from "@pages/achievement/AchievementPage";
import { Month } from "@shared/period/month";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useMemo } from "react";


// useTabRoute에서 받을 params의 타입
interface AchievementTabRouteParams {
  month: Month;
}

export const AchievementTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<AchievementTabRouteParams>(() => {
    if(tab === "achievement" && routeParams){
      const params = routeParams as AchievementTabRouteParams;
      if(!params.month){
        throw new Error("Invalid AchievementTab tab routeParams.");
      }
      return params;
    } else {
      return { month: Month.now() };
    }
  }, [routeParams, tab]);

  if(tab !== "achievement") return null;
  return (
    <>
      <AchievementPage month={params.month} />
    </>
  )
}