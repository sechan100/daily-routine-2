import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import { UseLeafProvider } from "./use-leaf";



const AdapterComponent = ({ view }: { view: ReactView }) => {
  const [show, setShow] = useState(true);

  if (!show) return null;
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