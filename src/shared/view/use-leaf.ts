import { DailyRoutineObsidianView } from "@app/obsidian-view";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { WorkspaceLeaf } from "obsidian";


interface UseDrLeafData {
  leaf: WorkspaceLeaf;
  setShow: (show: boolean) => void;
}
interface UseLeaf {
  leaf: WorkspaceLeaf;
  view: DailyRoutineObsidianView;
  leafBgColor: string;
  refresh: () => void;
}
export const [UseLeafProvider, useLeaf] = createStoreContext<UseDrLeafData, UseLeaf>((data, set, get) => {
  // CSS 변수 문자열을 그대로 사용하여 테마 변경을 실시간으로 따라가도록 한다.
  const leafBgColor = "var(--background-primary)";

  return {
    leaf: data.leaf,
    view: data.leaf.view as DailyRoutineObsidianView,
    leafBgColor,
    refresh: () => {
      data.setShow(false);
      setTimeout(() => data.setShow(true), 0);
    },
  }
});

