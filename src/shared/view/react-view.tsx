import { StrictMode, useState } from "react";
import { ItemView, View, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { createContext, useContext } from "react";
import { createStoreContext } from "@shared/zustand/create-store-context";
import { DailyRoutineObsidianView } from "@app/obsidian-view";



interface UseDrLeafData {
  leaf: WorkspaceLeaf;
  setShow: (show: boolean) => void;
}
interface UseLeaf {
  leaf: WorkspaceLeaf;
  view: DailyRoutineObsidianView;
  leafStyle: CSSStyleDeclaration;
  refresh: () => void;
}
export const [UseLeafProvider, useLeaf] = createStoreContext<UseDrLeafData, UseLeaf>((data, set, get) => ({
  leaf: data.leaf,
  view: data.leaf.view as DailyRoutineObsidianView,
  // @ts-ignore
  leafStyle: getComputedStyle(data.leaf.containerEl),
  refresh: () => {
    data.setShow(false);
    setTimeout(() => data.setShow(true), 0);
  }
}))


const AdapterComponent = ({ view }: { view: ReactView }) => {
  const [show, setShow] = useState(true);

  if(!show) return null;
  return (
    <StrictMode>
      <UseLeafProvider data={{
        leaf: view.leaf,
        setShow
      }}>
        {view.render()}
      </UseLeafProvider>
    </StrictMode>
  )
}


/**
 * React를 사용하는 뷰를 만들 때 사용하는 추상 클래스
 */
export abstract class ReactView extends ItemView {
	root: Root | null = null;
  viewTypeName: string;
  displayText: string;

	constructor(leaf: WorkspaceLeaf, info: {
    viewTypeName: string,
    displayText: string
  }) {
		super(leaf);
    this.viewTypeName = info.viewTypeName;
    this.displayText = info.displayText;
	}

	getViewType() {
    return this.viewTypeName;
	}

	getDisplayText() {
    return this.displayText;
  }

  /**
   * 해당 메서드로 함수형 컴포넌트를 구현하면 된다.
   */
  abstract render(): JSX.Element;

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(<AdapterComponent view={this} />);
	}

	async onClose() {
		this.root?.unmount();
	}
}