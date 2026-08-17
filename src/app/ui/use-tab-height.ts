import { useLeaf } from "@shared/view/use-leaf"
import { useEffect, useState } from "react";
import { num_tabsBottomGap, num_tabsHeight } from "./DailyRoutineView";


const getTabHeight = (contentEl: HTMLElement) => {
  const style = getComputedStyle(contentEl);
  const contentHeight = parseFloat(style.height);
  // SwipeableCalendar가 var(--input-height)만큼을 네비게이션 높이로 추가하므로, 미리 빼서 전체가 탭 영역 안에 들어가도록 한다.
  let inputHeight = parseFloat(style.getPropertyValue("--input-height"));
  if(Number.isNaN(inputHeight)) inputHeight = 40;
  return contentHeight - (num_tabsHeight + num_tabsBottomGap) - inputHeight;
}

/**
 * view가 확실히 렌더링된 이후인지 주의.
 */
export const useTabHeight = () => {
  const view = useLeaf(s=>s.view);
  const [tabHeight, setTabHeight] = useState(() => getTabHeight(view.contentEl));

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setTabHeight(getTabHeight(view.contentEl));
    });
    observer.observe(view.contentEl);
    return () => observer.disconnect();
  }, [view]);

  return tabHeight;
}
