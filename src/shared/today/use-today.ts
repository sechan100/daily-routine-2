import { Day } from "@shared/period/day";
import { useEffect } from "react";
import { create } from "zustand";


const CHECK_INTERVAL_MS = 60 * 1000;

type TodayStore = {
  today: Day;
};

/**
 * '오늘'을 담는 전역 store.
 * 렌더 시점에 Day.today()를 한 번 평가해 들고 있으면, 자정을 넘겨 열어둔 뷰가 어제를 계속 오늘로 보여준다.
 * 날짜가 실제로 바뀔 때만 갱신되므로, 구독하는 컴포넌트는 자정을 넘길 때만 다시 렌더링된다.
 */
export const useToday = create<TodayStore>(() => ({
  today: Day.today(),
}));

/**
 * 날짜가 바뀌었다면 store를 새 오늘로 갱신한다.
 */
export const syncToday = () => {
  if(useToday.getState().today.isToday()) return;
  useToday.setState({ today: Day.today() });
}

/**
 * 날짜 변경을 감지한다. 1분 주기로 확인하고, 절전 해제 등으로 타이머가 밀렸을 수 있으므로 창이 다시 보이거나 focus될 때도 확인한다.
 * 뷰의 최상단에서 한 번만 마운트한다.
 * @param el 뷰의 element. popout window에 열린 뷰도 자기 창의 이벤트를 받도록 element가 속한 창에 등록한다.
 */
export const useTodayWatcher = (el: HTMLElement) => {
  useEffect(() => {
    const win = el.win;
    const doc = el.doc;
    const onVisibilityChange = () => {
      if(doc.visibilityState === "visible") syncToday();
    };

    syncToday();
    const intervalId = window.setInterval(syncToday, CHECK_INTERVAL_MS);
    doc.addEventListener("visibilitychange", onVisibilityChange);
    win.addEventListener("focus", syncToday);
    return () => {
      window.clearInterval(intervalId);
      doc.removeEventListener("visibilitychange", onVisibilityChange);
      win.removeEventListener("focus", syncToday);
    };
  }, [el]);
}
