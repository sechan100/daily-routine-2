import { DND_SCROLL_CONTAINER_CLASS_NAME } from "@/shared/dnd/ScrollContainer";
import { RefObject, useCallback, useState } from "react";


/**
 * tasks가 늘어날 때 자동으로 tasks panel의 크기를 늘릴 최대 비율
 * 나머지 비율은 routine tree panel이 차지함
 */
const TASKS_PANEL_MAX_SIZE = 250; // px

type NotePanelArgs = {
  tasksPanelRef: RefObject<HTMLElement>;
}

export const useNotePanel = ({ tasksPanelRef }: NotePanelArgs) => {
  const [tasksPanelHeight, setTasksPanelHeight] = useState<number>(0);

  const optimizePanelLayout = useCallback(() => {
    const tasksPanel = tasksPanelRef.current
    if (!tasksPanel) {
      return;
    }
    const tasksPanelScrollContainer = tasksPanel.querySelector(`.${DND_SCROLL_CONTAINER_CLASS_NAME}`);
    if (!tasksPanelScrollContainer) {
      throw new Error("Tasks panel scroll container not found");
    }
    // scrollContainer의 scrollHeight로 비교해야 여기서 강제 설정한 height가 아니라, 실제 tasks의 개수에 따른 높이를 가져올 수 있다.
    if (tasksPanelScrollContainer.scrollHeight > TASKS_PANEL_MAX_SIZE) {
      tasksPanel.style.height = `${TASKS_PANEL_MAX_SIZE}px`;
    } else {
      tasksPanel.style.height = "";
    }
    setTasksPanelHeight(tasksPanel.clientHeight);
  }, [tasksPanelRef]);


  return {
    tasksPanelHeight,
    optimizePanelLayout,
  }
}