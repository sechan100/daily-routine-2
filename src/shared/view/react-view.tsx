import { StrictMode } from "react";
import { ItemView, View, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { createContext, useContext } from "react";


const LeafContext = createContext<WorkspaceLeaf | null>(null);
export const useLeaf = <T extends View>(): {
  leaf: WorkspaceLeaf,
  view: T
} => {
  const leaf = useContext(LeafContext);
  if(!leaf) throw new Error("LeafContext not found");
  return {
    leaf, 
    view: leaf.view as T
  }
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

	getDisplayText(){
    return this.displayText;
  }

  /**
   * 해당 메서드로 함수형 컴포넌트를 구현하면 된다.
   */
  abstract render(): JSX.Element;

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
      <StrictMode>
        <LeafContext.Provider value={this.leaf}>
          {this.render()}
        </LeafContext.Provider>
      </StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}