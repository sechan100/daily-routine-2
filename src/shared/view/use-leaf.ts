import { DailyRoutineObsidianView } from "@app/obsidian-view";
import { plugin } from "@shared/utils/plugin-service-locator";
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
  // @ts-ignore
  const isMobile = plugin().app.isMobile;
  // @ts-ignore
  const leafBgColor = isMobile ? "#ffffff" : getComputedStyle(data.leaf.containerEl).backgroundColor;

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

