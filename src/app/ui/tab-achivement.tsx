import { AchivementPage } from "@pages/achivement/AchivementPage";
import { Month } from "@shared/period/month";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useMemo } from "react";


// useTabRoute에서 받을 params의 타입
interface AchivementTabRouteParams {
  month: Month;
}

export const AchivementTab = () => {
  const { tab, routeParams } = useTabRoute();

  const params = useMemo<AchivementTabRouteParams>(() => {
    if(tab === "achivement" && routeParams){
      const params = routeParams as AchivementTabRouteParams;
      if(!params.month){
        throw new Error("Invalid AchivementTab tab routeParams.");
      }
      return params;
    } else {
      return { month: Month.now() };
    }
  }, [routeParams, tab]);

  if(tab !== "achivement") return null;
  return (
    <>
      <AchivementPage month={params.month} />
    </>
  )
}