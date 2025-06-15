import { createStoreContext } from "@/shared/zustand/create-store-context";
import { Platform, WorkspaceLeaf } from "obsidian";
import { ReactView } from "./react-view";


interface UseDrLeafData {
  leaf: WorkspaceLeaf;
  setShow: (show: boolean) => void;
}
interface UseLeaf {
  leaf: WorkspaceLeaf;
  view: ReactView;
  leafBgColor: string;
  refresh: () => void;
}
export const [UseLeafProvider, useLeaf] = createStoreContext<UseDrLeafData, UseLeaf>((data, set, get) => {
  // @ts-ignore
  const leafBgColor = Platform.isMobile ? "#ffffff" : getComputedStyle(data.leaf.containerEl).backgroundColor;

  return {
    leaf: data.leaf,
    view: data.leaf.view as ReactView,
    leafBgColor,
    refresh: () => {
      data.setShow(false);
      setTimeout(() => data.setShow(true), 0);
    },
  }
});

